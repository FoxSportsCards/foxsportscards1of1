import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";

function parseAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim();
}

export async function requireAdmin(request: Request) {
  const token = getBearerToken(request);
  const admin = getSupabaseAdminClient();

  if (!admin) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "El panel no está disponible temporalmente." }, { status: 503 }),
    };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "El panel no está disponible temporalmente." }, { status: 503 }),
    };
  }

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Tu sesión expiró. Inicia sesión de nuevo." }, { status: 401 }),
    };
  }

  const authClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user?.email) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Tu sesión expiró. Inicia sesión de nuevo." }, { status: 401 }),
    };
  }

  const email = user.email.toLowerCase();
  const configuredAdmins = parseAdminEmails();
  const allowedByEnv = configuredAdmins.includes(email);

  const { data: adminUser } = await admin
    .from("admin_users")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (!allowedByEnv && !adminUser) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "No tienes acceso a este panel." }, { status: 403 }),
    };
  }

  return { ok: true as const, admin, user };
}
