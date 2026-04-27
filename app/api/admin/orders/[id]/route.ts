import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/adminAuth";
import { syncSanityInventory } from "@/lib/sanity.admin";
import { editTelegramMessage } from "@/lib/telegram";
import type { CartLine } from "@/lib/whatsapp";
import type { Database } from "@/types/supabase";

export const runtime = "edge";

type RouteContext = {
  params: {
    id: string;
  };
};

type ActionPayload = {
  action?: "confirm" | "reject";
  note?: string | null;
};

async function syncTelegramStatus(messageId: number | null, text: string) {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!chatId || !messageId) return;
  await editTelegramMessage(chatId, messageId, text);
}

function parseOrderSlugs(items: unknown) {
  if (!Array.isArray(items)) return [];
  return Array.from(
    new Set(
      (items as CartLine[])
        .map((item) => item.slug)
        .filter((slug): slug is string => typeof slug === "string" && slug.length > 0),
    ),
  );
}

async function syncConfirmedInventoryToSanity(
  admin: SupabaseClient<Database>,
  items: unknown,
) {
  const slugs = parseOrderSlugs(items);
  if (!slugs.length) return [];

  const { data } = await admin
    .from("product_inventory")
    .select("product_slug,quantity")
    .in("product_slug", slugs);

  return Promise.all(
    (data ?? []).map((row) => syncSanityInventory(row.product_slug, row.quantity)),
  );
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const payload = (await request.json().catch(() => null)) as ActionPayload | null;
  const action = payload?.action;

  if (action !== "confirm" && action !== "reject") {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  const result =
    action === "confirm"
      ? await auth.admin.rpc("confirm_customer_order", { order_id: params.id })
      : await auth.admin.rpc("reject_customer_order", { order_id: params.id, note: payload?.note ?? null });

  if (result.error || !result.data) {
    return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 400 });
  }

  const sanitySync = action === "confirm" ? await syncConfirmedInventoryToSanity(auth.admin, result.data.items) : [];

  await syncTelegramStatus(
    result.data.telegram_message_id,
    `Pedido ${result.data.order_number}: ${action === "confirm" ? "confirmado" : "rechazado"}.`,
  );

  return NextResponse.json({ order: result.data, sanitySync });
}
