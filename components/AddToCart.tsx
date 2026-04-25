"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/store/cart";
import { isSoldOut } from "@/lib/productAvailability";
import type { Locale } from "@/lib/locale";
import type { Product } from "@/types/product";

type AddToCartProps = {
  product: Product;
  locale?: Locale;
};

export default function AddToCart({ product, locale = "es" }: AddToCartProps) {
  const add = useCart((state) => state.add);
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soldOut = isSoldOut(product);

  const handleClick = () => {
    if (soldOut) return;
    add(product, 1);
    setJustAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAdded(false), 1800);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const label = locale === "en" ? "Add to cart" : "Agregar al carrito";
  const addedLabel = locale === "en" ? "Added" : "Agregado";
  const soldOutLabel = locale === "en" ? "Sold out" : "Agotado";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      className="focus-ring rounded-full border border-blue/20 bg-blue px-5 py-3 text-sm font-semibold text-white shadow-glow hover:brightness-95 disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-muted disabled:shadow-none"
      aria-live="polite"
    >
      {soldOut ? soldOutLabel : justAdded ? addedLabel : label}
    </button>
  );
}
