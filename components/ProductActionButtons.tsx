"use client";

import { useEffect, useState } from "react";
import AddToCart from "@/components/AddToCart";
import WhatsAppBuy from "@/components/WhatsAppBuy";
import { useReleaseSchedule } from "@/hooks/useReleaseSchedule";
import { getAvailableQuantity, isSoldOut } from "@/lib/productAvailability";
import type { Locale } from "@/lib/locale";
import type { Product } from "@/types/product";

type ProductActionButtonsProps = {
  product: Product;
  locale?: Locale;
};

export default function ProductActionButtons({ product, locale = "es" }: ProductActionButtonsProps) {
  const { isPurchaseLocked } = useReleaseSchedule(product.status, product.releaseDate, locale);
  const soldOut = isSoldOut(product);
  const availableQuantity = getAvailableQuantity(product);
  const maxQuantity = availableQuantity === null ? 99 : Math.max(1, availableQuantity);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity((current) => Math.min(Math.max(1, current), maxQuantity));
  }, [maxQuantity]);

  function updateQuantity(nextQuantity: number) {
    if (!Number.isFinite(nextQuantity)) {
      setQuantity(1);
      return;
    }
    setQuantity(Math.min(Math.max(1, Math.floor(nextQuantity)), maxQuantity));
  }

  const quantityLabel = locale === "en" ? "Quantity" : "Cantidad";
  const availableLabel =
    availableQuantity === null
      ? locale === "en"
        ? "Available by request"
        : "Disponible bajo pedido"
      : locale === "en"
        ? `${availableQuantity} available`
        : `${availableQuantity} disponibles`;

  return (
    <div className="space-y-3">
      {!soldOut ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-3 rounded-full border border-line bg-white px-3 py-2 shadow-soft">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{quantityLabel}</span>
            <button
              type="button"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={quantity <= 1}
              className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-lg font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-35"
              aria-label={locale === "en" ? "Decrease quantity" : "Bajar cantidad"}
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(event) => updateQuantity(Number(event.target.value))}
              className="focus-ring w-16 rounded-full border border-line bg-surface px-2 py-2 text-center text-sm font-bold text-ink"
              aria-label={quantityLabel}
            />
            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-lg font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-35"
              aria-label={locale === "en" ? "Increase quantity" : "Subir cantidad"}
            >
              +
            </button>
          </div>
          <span className="text-xs font-semibold text-muted">{availableLabel}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {!isPurchaseLocked && <AddToCart product={product} locale={locale} quantity={quantity} />}
        {soldOut ? (
          <span className="inline-flex items-center justify-center rounded-full border border-line bg-line px-5 py-3 text-sm font-semibold text-muted">
            {locale === "en" ? "Sold out" : "Agotado"}
          </span>
        ) : (
          <WhatsAppBuy product={product} locale={locale} quantity={quantity} mode={isPurchaseLocked ? "reserve" : "buy"} />
        )}
      </div>
    </div>
  );
}
