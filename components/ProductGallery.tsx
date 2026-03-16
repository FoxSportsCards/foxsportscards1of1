"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/locale";
import type { Product, ProductImage } from "@/types/product";

type ProductGalleryProps = {
  title: string;
  images: ProductImage[];
  status?: Product["status"];
  locale?: Locale;
};

const STATUS_TEXT: Record<NonNullable<Product["status"]>, Record<Locale, string>> = {
  available: { es: "Disponible", en: "Available" },
  reserved: { es: "Reservado", en: "Reserved" },
  sold: { es: "Vendido", en: "Sold" },
  upcoming: { es: "Próximo lanzamiento", en: "Upcoming release" },
};

const STATUS_STYLE: Record<NonNullable<Product["status"]>, string> = {
  available: "border-green/30 bg-green/10 text-green",
  reserved: "border-blue/35 bg-blue/10 text-blue",
  sold: "border-red/35 bg-red/10 text-red",
  upcoming: "border-blue/35 bg-blue/10 text-blue",
};

const FALLBACK_IMAGE: ProductImage = {
  url: "/hero.jpg",
  alt: "Imagen del producto",
  label: "placeholder",
};

export default function ProductGallery({
  title,
  images,
  status = "available",
  locale = "es",
}: ProductGalleryProps) {
  const safeImages = useMemo(() => (images.length > 0 ? images : [FALLBACK_IMAGE]), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const activeImage = safeImages[Math.min(activeIndex, safeImages.length - 1)];

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
        <div className="relative aspect-[4/5] md:aspect-[4/4.5]">
          <Image
            key={activeImage.url}
            src={activeImage.url}
            alt={activeImage.alt ?? title}
            fill
            sizes="(min-width: 1280px) 34vw, (min-width: 1024px) 44vw, 92vw"
            className="object-cover"
            priority
          />
        </div>
        <span
          className={clsx(
            "absolute left-4 top-4 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
            STATUS_STYLE[status],
          )}
        >
          {STATUS_TEXT[status][locale]}
        </span>
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="focus-ring absolute bottom-4 right-4 rounded-full border border-line bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:border-blue/35 hover:text-blue"
        >
          {locale === "en" ? "Zoom" : "Ampliar"}
        </button>
      </div>

      {safeImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-5">
          {safeImages.map((image, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={`${image.url}-${image.label ?? index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={clsx(
                  "focus-ring group relative aspect-square overflow-hidden rounded-2xl border bg-white",
                  active ? "border-blue shadow-glow" : "border-line hover:border-blue/35",
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt ?? title}
                  fill
                  sizes="120px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {zoomOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#081126]/75 p-4 backdrop-blur-sm">
          <div className="flex justify-end pb-3">
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="focus-ring rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-white/20"
            >
              {locale === "en" ? "Close" : "Cerrar"}
            </button>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/20 bg-black/30">
            <Image
              src={activeImage.url}
              alt={activeImage.alt ?? title}
              fill
              sizes="92vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
