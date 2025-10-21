"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/store/cart";
import type { Product } from "@/types/product";

export default function AddToCart({ product }: { product: Product }) {
  const add = useCart((state) => state.add);
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    add(product, 1);
    setJustAdded(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setJustAdded(false), 2000);
  };

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  return (
    <button
      onClick={handleClick}
      className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      aria-live="polite"
    >
      {justAdded ? "A\u00f1adido \u2713" : "A\u00f1adir al carrito"}
    </button>
  );
}
