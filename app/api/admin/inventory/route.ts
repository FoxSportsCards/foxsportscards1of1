import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getProductCategoryLabel } from "@/lib/productLabels";
import { getAllProducts } from "@/lib/products";
import { syncSanityInventory } from "@/lib/sanity.admin";

export const runtime = "edge";

type InventoryPayload = {
  productSlug?: string;
  productTitle?: string;
  quantity?: number;
  trackInventory?: boolean;
  lowStockThreshold?: number;
};

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const [{ data: inventoryRows, error }, products] = await Promise.all([
    auth.admin.from("product_inventory").select("*").order("product_slug", { ascending: true }),
    getAllProducts(),
  ]);

  if (error) {
    return NextResponse.json({ error: "No se pudo cargar el inventario." }, { status: 500 });
  }

  const inventoryMap = new Map((inventoryRows ?? []).map((row) => [row.product_slug, row]));
  const inventory = products.map((product) => ({
    productSlug: product.slug,
    productTitle: product.title,
    categoryLabel: getProductCategoryLabel(product, "es"),
    sanityQuantity: product.inventory,
    status: product.status,
    row: inventoryMap.get(product.slug) ?? null,
  }));

  return NextResponse.json({ inventory });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const payload = (await request.json().catch(() => null)) as InventoryPayload | null;
  const productSlug = payload?.productSlug?.trim();

  if (!productSlug) {
    return NextResponse.json({ error: "Falta seleccionar el producto." }, { status: 400 });
  }

  const quantity = Math.max(0, Number(payload?.quantity ?? 0));
  const lowStockThreshold = Math.max(0, Number(payload?.lowStockThreshold ?? 1));

  const { data, error } = await auth.admin
    .from("product_inventory")
    .upsert({
      product_slug: productSlug,
      product_title: payload?.productTitle ?? null,
      quantity,
      track_inventory: payload?.trackInventory ?? true,
      low_stock_threshold: lowStockThreshold,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el inventario." }, { status: 500 });
  }

  const sanitySync = await syncSanityInventory(productSlug, quantity);

  return NextResponse.json({ inventory: data, sanitySync });
}
