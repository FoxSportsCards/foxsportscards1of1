"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/locale";

type ProductBackButtonProps = {
  fallbackHref?: string;
  locale?: Locale;
};

export default function ProductBackButton({ fallbackHref = "/catalogo", locale = "es" }: ProductBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className="focus-ring inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted shadow-soft hover:border-blue/35 hover:text-blue"
    >
      <span aria-hidden>{"<"}</span>
      <span>{locale === "en" ? "Back" : "Volver"}</span>
    </button>
  );
}

