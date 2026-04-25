"use client";

import AddToCart from "@/components/AddToCart";
import WhatsAppBuy from "@/components/WhatsAppBuy";
import { useReleaseSchedule } from "@/hooks/useReleaseSchedule";
import { isSoldOut } from "@/lib/productAvailability";
import type { Locale } from "@/lib/locale";
import type { Product } from "@/types/product";

type ProductActionButtonsProps = {
  product: Product;
  locale?: Locale;
};

export default function ProductActionButtons({ product, locale = "es" }: ProductActionButtonsProps) {
  const { isPurchaseLocked } = useReleaseSchedule(product.status, product.releaseDate, locale);
  const soldOut = isSoldOut(product);

  return (
    <div className="flex flex-wrap gap-3">
      {!isPurchaseLocked && <AddToCart product={product} locale={locale} />}
      {soldOut ? (
        <span className="inline-flex items-center justify-center rounded-full border border-line bg-line px-5 py-3 text-sm font-semibold text-muted">
          {locale === "en" ? "Sold out" : "Agotado"}
        </span>
      ) : (
        <WhatsAppBuy product={product} locale={locale} mode={isPurchaseLocked ? "reserve" : "buy"} />
      )}
    </div>
  );
}
