"use client";

import { useRouter } from "next/navigation";

type ProductBackButtonProps = {
  fallbackHref?: string;
};

export default function ProductBackButton({ fallbackHref = "/catalogo" }: ProductBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-soft backdrop-blur transition hover:border-white/40 hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <span className="inline-block rotate-180">➜</span>
      <span>Regresar</span>
    </button>
  );
}

