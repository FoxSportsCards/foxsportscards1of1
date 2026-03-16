import { formatLocaleTag, type Locale } from "@/lib/locale";
import type { Product } from "@/types/product";

export function formatCurrency(amount: number, currency: string, locale: Locale = "es"): string {
  if (Number.isNaN(amount)) {
    return amount.toString();
  }
  try {
    return new Intl.NumberFormat(formatLocaleTag(locale), {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(formatLocaleTag(locale))}`;
  }
}

export function getProductPrices(product: Product, locale: Locale = "es"): { primary: string; secondary?: string } {
  const primary = formatCurrency(product.price, product.currency, locale);
  const hasSecondary = Boolean(
    product.alternatePricing?.enabled &&
      typeof product.alternatePricing.amount === "number" &&
      !Number.isNaN(product.alternatePricing.amount) &&
      product.alternatePricing.currency,
  );
  const secondary = hasSecondary
    ? formatCurrency(
        product.alternatePricing!.amount!,
        product.alternatePricing!.currency ?? product.currency,
        locale,
      )
    : undefined;
  return secondary ? { primary, secondary } : { primary };
}
