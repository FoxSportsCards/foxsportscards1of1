"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Product, ProductImage } from "@/types/product";

type ProductGalleryProps = {
  title: string;
  images: ProductImage[];
  status?: Product["status"];
};

const STATUS_LABEL: Record<NonNullable<Product["status"]>, string> = {
  available: "Disponible",
  reserved: "Reservado",
  sold: "Vendido",
  upcoming: "Próximo lanzamiento",
};

const FALLBACK_IMAGE: ProductImage = {
  url: "/hero.jpg",
  alt: "Imagen del producto",
  label: "placeholder",
};

export default function ProductGallery({ title, images, status = "available" }: ProductGalleryProps) {
  const sanitizedImages = useMemo(
    () => (images && images.length > 0 ? images : [FALLBACK_IMAGE]),
    [images],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const activeImage = sanitizedImages[Math.min(activeIndex, sanitizedImages.length - 1)];
  const hasStatusBadge = status !== "available";

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-surface shadow-soft">
        <div className="relative aspect-[4/5] md:aspect-square">
          <Image
            key={activeImage.url}
            src={activeImage.url}
            alt={activeImage.alt ?? title}
            fill
            sizes="(min-width: 1280px) 32vw, (min-width: 1024px) 45vw, 90vw"
            className="object-cover"
            priority
          />
        </div>
        {hasStatusBadge && (
          <span className="absolute left-5 top-5 rounded-full bg-black/70 px-4 py-1 text-sm uppercase tracking-[0.3em] text-white">
            {STATUS_LABEL[status]}
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsZoomOpen(true)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white backdrop-blur transition hover:bg-black/80"
        >
          Ver grande
        </button>
      </div>

      {sanitizedImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5">
          {sanitizedImages.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${image.url}-${image.label ?? index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group relative aspect-square overflow-hidden rounded-2xl border transition ${
                  isActive ? "border-accent shadow-glow" : "border-white/10 hover:border-white/30"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt ?? title}
                  fill
                  sizes="120px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {image.label && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-white">
                    {image.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {isZoomOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/85 backdrop-blur">
          <div className="flex items-center justify-between px-4 pb-2 pt-4 sm:px-6">
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setIsZoomOpen(false)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:border-white/40 hover:bg-black/90"
            >
              <span className="inline-block rotate-180">➜</span>
              <span>Cerrar</span>
            </button>
          </div>
          <div className="relative flex-1 px-4 pb-6 sm:px-6">
            <div className="relative h-full w-full max-h-full overflow-hidden rounded-4xl border border-white/20 bg-black/60 p-4 shadow-glow">
              <div className="relative h-full w-full">
                <Image
                  src={activeImage.url}
                  alt={activeImage.alt ?? title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 90vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
