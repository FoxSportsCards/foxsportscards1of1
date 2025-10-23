export function formatCurrency(amount: number, currency: string): string {
  if (Number.isNaN(amount)) {
    return amount.toString();
  }
  try {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("es-DO")}`;
  }
}

import type { Product } from "@/types/product";

export function getProductPrices(product: Product): { primary: string; secondary?: string } {
  const primary = formatCurrency(product.price, product.currency);
  const hasSecondary = Boolean(
    product.alternatePricing?.enabled &&
      typeof product.alternatePricing.amount === "number" &&
      !Number.isNaN(product.alternatePricing.amount) &&
      product.alternatePricing.currency,
  );
  const secondary = hasSecondary
    ? formatCurrency(product.alternatePricing!.amount!, product.alternatePricing!.currency ?? product.currency)
    : undefined;
  return secondary ? { primary, secondary } : { primary };
}
