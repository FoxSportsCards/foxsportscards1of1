import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProductBySlug } from "@/lib/products";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTelegramOrderNotification } from "@/lib/telegram";
import type { CartLine } from "@/lib/whatsapp";
import type { CustomerProfile } from "@/types/account";
import type { Database, Json } from "@/types/supabase";

export const runtime = "edge";

type OrderPayload = {
  lines?: CartLine[];
  whatsappMessage?: string;
};

function makeOrderNumber() {
  return `FSC-${Date.now().toString(36).toUpperCase()}`;
}

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim();
}

function cleanLines(lines: CartLine[] | undefined) {
  if (!Array.isArray(lines)) return [];
  return lines
    .map((line) => ({
      title: String(line.title ?? "").trim(),
      slug: String(line.slug ?? "").trim(),
      qty: Math.max(1, Number(line.qty) || 1),
      price: Number(line.price) || 0,
      currency: line.currency ?? "DOP",
    }))
    .filter((line) => line.title && line.slug);
}

async function getCurrentUser(request: Request) {
  const token = getBearerToken(request);
  if (!token || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;

  const authClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const {
    data: { user },
  } = await authClient.auth.getUser(token);

  return user;
}

export async function POST(request: Request) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const payload = (await request.json().catch(() => null)) as OrderPayload | null;
  const requestedLines = cleanLines(payload?.lines);

  if (!requestedLines.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const user = await getCurrentUser(request);
  let profile: CustomerProfile | null = null;

  if (user) {
    const { data } = await admin.from("customer_profiles").select("*").eq("id", user.id).maybeSingle();
    profile = data ?? null;
  }

  const verifiedLines: CartLine[] = [];

  for (const line of requestedLines) {
    const product = await getProductBySlug(line.slug);
    const quantity = Math.max(1, line.qty);

    const { data: inventory } = await admin
      .from("product_inventory")
      .select("*")
      .eq("product_slug", product.slug)
      .maybeSingle();

    const initialQuantity = typeof product.inventory === "number" ? product.inventory : 0;
    const trackInventory = inventory?.track_inventory ?? true;
    const availableQuantity = inventory?.quantity ?? initialQuantity;

    if (!inventory) {
      await admin.from("product_inventory").upsert({
        product_slug: product.slug,
        product_title: product.title,
        quantity: initialQuantity,
        track_inventory: true,
      });
    } else if (inventory.product_title !== product.title) {
      await admin.from("product_inventory").update({ product_title: product.title }).eq("product_slug", product.slug);
    }

    if (trackInventory && availableQuantity < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.title}.`, slug: product.slug },
        { status: 409 },
      );
    }

    verifiedLines.push({
      title: product.title,
      slug: product.slug,
      qty: quantity,
      price: product.price,
      currency: product.currency ?? "DOP",
    });
  }

  const currency = verifiedLines.find((line) => line.currency)?.currency ?? "DOP";
  const totalAmount = verifiedLines.reduce((sum, line) => sum + line.qty * line.price, 0);
  const orderNumber = makeOrderNumber();

  const { data: order, error } = await admin
    .from("customer_orders")
    .insert({
      user_id: user?.id ?? null,
      order_number: orderNumber,
      total_amount: totalAmount,
      currency,
      items: verifiedLines as unknown as Json,
      customer_snapshot: profile ? (profile as unknown as Json) : null,
      whatsapp_message: payload?.whatsappMessage ?? null,
    })
    .select("*")
    .single();

  if (error || !order) {
    return NextResponse.json({ error: error?.message ?? "Order could not be created." }, { status: 500 });
  }

  const telegram = await sendTelegramOrderNotification(order, profile);
  if (telegram.messageId) {
    await admin
      .from("customer_orders")
      .update({ telegram_message_id: telegram.messageId })
      .eq("id", order.id);
  }

  return NextResponse.json({
    status: "created",
    profile,
    orderNumber,
    orderId: order.id,
  });
}
