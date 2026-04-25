import type { Product } from "@/types/product";

export function getAvailableQuantity(product: Product) {
  return typeof product.inventory === "number" ? product.inventory : null;
}

export function isSoldOut(product: Product) {
  const quantity = getAvailableQuantity(product);
  return product.status === "sold" || (quantity !== null && quantity <= 0);
}
