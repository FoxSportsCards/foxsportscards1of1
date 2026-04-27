import type { SupabaseClient } from "@supabase/supabase-js";
import { syncSanityInventory } from "@/lib/sanity.admin";
import { sendTelegramLowStockAlert } from "@/lib/telegram";
import type { CartLine } from "@/lib/whatsapp";
import type { Database } from "@/types/supabase";

export function parseOrderSlugs(items: unknown) {
  if (!Array.isArray(items)) return [];

  return Array.from(
    new Set(
      (items as CartLine[])
        .map((item) => item.slug)
        .filter((slug): slug is string => typeof slug === "string" && slug.length > 0),
    ),
  );
}

export async function notifyLowStockAfterOrder(
  admin: SupabaseClient<Database>,
  items: unknown,
) {
  const slugs = parseOrderSlugs(items);
  if (!slugs.length) return;

  const { data } = await admin
    .from("product_inventory")
    .select("product_slug, product_title, quantity, low_stock_threshold, track_inventory")
    .in("product_slug", slugs);

  for (const row of data ?? []) {
    if (!row.track_inventory) continue;
    const threshold = row.low_stock_threshold ?? 1;
    if (row.quantity <= threshold) {
      await sendTelegramLowStockAlert(row.product_title ?? row.product_slug, row.quantity);
    }
  }
}

export async function syncConfirmedInventoryToSanity(
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
