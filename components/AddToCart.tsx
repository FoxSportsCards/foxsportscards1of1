"use client";

import { useCart } from "@/store/cart";
import type { Product } from "@/types/product";

export default function AddToCart({ product }: { product: Product }) {
  const add = useCart((state) => state.add);

  return (
    <button
      onClick={() => add(product, 1)}
      className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
    >
      Añadir al carrito
    </button>
  );
}
