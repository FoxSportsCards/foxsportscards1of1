import type { Product } from "@/types/product";
export { getAvailableQuantity, isSoldOut } from "@/lib/productAvailability";

export type InventoryRecord = {
  product_slug: string;
  product_title: string | null;
  quantity: number;
  reserved_quantity: number;
  track_inventory: boolean;
  low_stock_threshold: number;
  updated_at: string;
};

function getSupabaseRestConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function getInventoryMap() {
  const config = getSupabaseRestConfig();
  if (!config) return new Map<string, InventoryRecord>();

  try {
    const response = await fetch(
      `${config.url}/rest/v1/product_inventory?select=product_slug,product_title,quantity,reserved_quantity,track_inventory,low_stock_threshold,updated_at`,
      {
        headers: {
          apikey: config.key,
          authorization: `Bearer ${config.key}`,
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) return new Map<string, InventoryRecord>();

    const rows = (await response.json()) as InventoryRecord[];
    return new Map(rows.map((row) => [row.product_slug, row]));
  } catch (error) {
    console.error("[inventory] could not load inventory snapshot", error);
    return new Map<string, InventoryRecord>();
  }
}

export function applyInventoryRecord(product: Product, inventory: InventoryRecord | undefined): Product {
  if (!inventory) {
    if (typeof product.inventory === "number" && product.inventory <= 0 && product.status === "available") {
      return { ...product, status: "sold" };
    }
    return product;
  }

  const quantity = inventory.track_inventory ? inventory.quantity : null;
  return {
    ...product,
    inventory: quantity,
    status:
      inventory.track_inventory && inventory.quantity <= 0 && product.status === "available"
        ? "sold"
        : product.status,
  };
}

export async function applyInventory(products: Product[]) {
  const inventoryMap = await getInventoryMap();
  if (!inventoryMap.size) {
    return products.map((product) => applyInventoryRecord(product, undefined));
  }
  return products.map((product) => applyInventoryRecord(product, inventoryMap.get(product.slug)));
}
