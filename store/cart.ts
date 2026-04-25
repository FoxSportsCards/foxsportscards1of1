'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/product';

type Item = { product: Product; qty: number };
type State = {
  items: Item[];
  add: (product: Product, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

export const useCart = create<State>()(persist((set, get) => ({
  items: [],
  add: (product, qty) => {
    const inventory = typeof product.inventory === 'number' ? product.inventory : null;
    if (product.status === 'sold' || (inventory !== null && inventory <= 0)) return;
    const items = [...get().items];
    const i = items.findIndex(it => it.product.slug === product.slug);
    if (i >= 0) {
      const nextQty = items[i].qty + qty;
      items[i].qty = inventory === null ? nextQty : Math.min(nextQty, inventory);
    }
    else items.push({ product, qty: inventory === null ? qty : Math.min(qty, inventory) });
    set({ items });
  },
  remove: (slug) => set({ items: get().items.filter(it => it.product.slug !== slug) }),
  clear: () => set({ items: [] }),
}), { name: 'foxsportscards1of1-cart' }));
