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
    const items = [...get().items];
    const i = items.findIndex(it => it.product.slug === product.slug);
    if (i >= 0) items[i].qty += qty;
    else items.push({ product, qty });
    set({ items });
  },
  remove: (slug) => set({ items: get().items.filter(it => it.product.slug !== slug) }),
  clear: () => set({ items: [] }),
}), { name: 'foxsportscards1of1-cart' }));
