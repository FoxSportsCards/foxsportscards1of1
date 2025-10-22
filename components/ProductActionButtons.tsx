"use client";

import AddToCart from "@/components/AddToCart";
import WhatsAppBuy from "@/components/WhatsAppBuy";
import { useReleaseSchedule } from "@/hooks/useReleaseSchedule";
import type { Product } from "@/types/product";

type ProductActionButtonsProps = {
  product: Product;
};

export default function ProductActionButtons({ product }: ProductActionButtonsProps) {
  const { isPurchaseLocked } = useReleaseSchedule(product.status, product.releaseDate);

  return (
    <div className="flex flex-wrap gap-3">
      {!isPurchaseLocked && <AddToCart product={product} />}
      <WhatsAppBuy product={product} mode={isPurchaseLocked ? "reserve" : "buy"} />
    </div>
  );
}

