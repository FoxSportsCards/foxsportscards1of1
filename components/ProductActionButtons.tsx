"use client";

import AddToCart from "@/components/AddToCart";
import WhatsAppBuy from "@/components/WhatsAppBuy";
import { useReleaseSchedule } from "@/hooks/useReleaseSchedule";
import type { Locale } from "@/lib/locale";
import type { Product } from "@/types/product";

type ProductActionButtonsProps = {
  product: Product;
  locale?: Locale;
};

export default function ProductActionButtons({ product, locale = "es" }: ProductActionButtonsProps) {
  const { isPurchaseLocked } = useReleaseSchedule(product.status, product.releaseDate, locale);

  return (
    <div className="flex flex-wrap gap-3">
      {!isPurchaseLocked && <AddToCart product={product} locale={locale} />}
      <WhatsAppBuy product={product} locale={locale} mode={isPurchaseLocked ? "reserve" : "buy"} />
    </div>
  );
}

