"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { formatCurrency } from "@/lib/pricing";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
};

const STATUS_FILTERS = ["Disponibles", "Reservados", "Pr\u00f3ximos", "Vendidos"];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function CatalogClient({ products }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filterOptions = useMemo(() => {
    const collected = new Map<string, string>();
    products.forEach((product) => {
      if (product.sport) {
        collected.set(normalize(product.sport), product.sport);
      }
      if (product.productType) {
        collected.set(normalize(product.productType), product.productType);
      }
      (product.tags ?? []).forEach((tag) => {
        if (tag) {
          collected.set(normalize(tag), tag);
        }
      });
    });

    const dynamic = Array.from(collected.values()).sort((a, b) => a.localeCompare(b));
    const merged = ["Todos", ...STATUS_FILTERS, ...dynamic];
    return merged.filter(
      (option, index) => merged.findIndex((value) => normalize(value) === normalize(option)) === index,
    );
  }, [products]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = normalize(searchTerm.trim());
    const active = normalize(activeFilter);

    return products.filter((product) => {
      const status = product.status ?? "available";
      const statusMatch =
        active === "todos"
          ? true
          : active === "disponibles"
            ? status === "available"
            : active === "reservados"
              ? status === "reserved"
              : active === "proximos"
                ? status === "upcoming"
                : active === "vendidos"
                  ? status === "sold"
                  : [
                      product.sport,
                      product.productType,
                      ...(product.tags ?? []),
                    ]
                      .filter(Boolean)
                      .map((value) => normalize(value as string))
                      .includes(active);

      const searchMatch =
        normalizedSearch.length === 0
          ? true
          : [product.title, product.shortDescription ?? "", ...(product.tags ?? [])]
              .filter(Boolean)
              .map((value) => normalize(value as string))
              .some((value) => value.includes(normalizedSearch));

      return statusMatch && searchMatch;
    });
  }, [products, activeFilter, searchTerm]);

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <span className="eyebrow">Cat\u00e1logo curado</span>
          <h1 className="text-4xl font-heading font-semibold text-white">Encuentra tu pr\u00f3xima pieza estrella</h1>
          <p className="max-w-2xl text-sm text-muted">
            Singles premium, cajas selladas y memorabilia certificada. Ordenamos primero las piezas disponibles y destacadas
            para que hagas movimientos r\u00e1pidos.
          </p>
        </div>
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-white/40 hover:text-white"
        >
          Gestionar contenido en el Studio \u2192
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por jugador, equipo o categor\u00eda"
            className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-muted shadow-soft focus:border-accent/60 focus:outline-none focus:ring-0"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-white"
            >
              Limpiar
            </button>
          )}
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-muted">
          {visibleProducts.length} {visibleProducts.length === 1 ? "pieza" : "piezas"}
        </span>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {filterOptions.map((option) => {
          const isActive = option === activeFilter;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setActiveFilter(option)}
              className={clsx(
                "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition",
                isActive
                  ? "border-white/40 bg-white/20 text-white shadow-glow"
                  : "border-white/10 bg-white/5 text-muted hover:border-white/25 hover:text-white",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => {
          const cover = product.images[0]?.url ?? "/hero.jpg";
          const alt = product.images[0]?.alt ?? product.title;
          const status = product.status ?? "available";

          return (
            <Link
              key={product.slug}
              href={`/producto/${product.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-soft transition hover:-translate-y-1 hover:border-white/25 hover:shadow-glow"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={cover}
                  alt={alt}
                  fill
                  sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 35vw, 80vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {status !== "available" && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {status === "sold" ? "Vendido" : status === "reserved" ? "Reservado" : "Pr\u00f3ximo"}
                  </span>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                  <span>{product.sport ?? product.productType ?? "Coleccionable"}</span>
                  {product.year && <span>{product.year}</span>}
                </div>
                <h3 className="line-clamp-2 text-sm font-medium text-white/90">{product.title}</h3>
                <div className="flex items-center justify-between text-sm font-semibold text-accent">
                  <span>{formatCurrency(product.price, product.currency)}</span>
                  {product.rarity && <span className="text-xs text-muted">{product.rarity}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {visibleProducts.length === 0 && (
        <div className="mt-16 rounded-3xl border border-white/5 bg-white/5 p-10 text-center text-sm text-muted">
          No encontramos piezas para esta b\u00fasqueda. Ajusta los filtros o escr\u00edbenos por WhatsApp y te ayudamos a localizarla.
        </div>
      )}
    </>
  );
}
