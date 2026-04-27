import type { SupabaseClient } from "@supabase/supabase-js";
import { syncSanityInventory } from "@/lib/sanity.admin";
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
