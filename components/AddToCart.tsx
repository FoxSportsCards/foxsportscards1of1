"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/store/cart";
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

  const handleClick = () => {
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

  return (
    <button
      type="button"
      onClick={handleClick}
      className="focus-ring rounded-full border border-blue/20 bg-blue px-5 py-3 text-sm font-semibold text-white shadow-glow hover:brightness-95"
      aria-live="polite"
    >
      {justAdded ? addedLabel : label}
    </button>
  );
}

