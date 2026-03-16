"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import ProductCard from "@/components/ProductCard";
import type { Locale } from "@/lib/locale";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
  locale?: Locale;
  initialFilter?: string;
};

const STATUS_FILTERS: Record<
  Locale,
  { all: string; available: string; reserved: string; upcoming: string; sold: string }
> = {
  es: {
    all: "Todos",
    available: "Disponibles",
    reserved: "Reservados",
    upcoming: "Próximos",
    sold: "Vendidos",
  },
  en: {
    all: "All",
    available: "Available",
    reserved: "Reserved",
    upcoming: "Upcoming",
    sold: "Sold",
  },
};

const FILTER_ALIASES = {
  all: ["todos", "all"],
  available: ["disponibles", "available"],
  reserved: ["reservados", "reserved"],
  upcoming: ["proximos", "upcoming"],
  sold: ["vendidos", "sold"],
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function isStatusAlias(activeFilter: string, statusKey: keyof typeof FILTER_ALIASES) {
  const active = normalize(activeFilter);
  return FILTER_ALIASES[statusKey].includes(active);
}

export function CatalogClient({ products, locale = "es", initialFilter = "Todos" }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const filters = STATUS_FILTERS[locale];

  const filterOptions = useMemo(() => {
    const collected = new Map<string, string>();
    products.forEach((product) => {
      if (product.sport) collected.set(normalize(product.sport), product.sport);
      if (product.productType) collected.set(normalize(product.productType), product.productType);
      (product.tags ?? []).forEach((tag) => {
        if (tag) collected.set(normalize(tag), tag);
      });
    });

    const dynamicFilters = Array.from(collected.values()).sort((a, b) => a.localeCompare(b));
    const merged = [filters.all, filters.available, filters.reserved, filters.upcoming, filters.sold, ...dynamicFilters];
    return merged.filter(
      (option, index) => merged.findIndex((value) => normalize(value) === normalize(option)) === index,
    );
  }, [products, filters]);

  useEffect(() => {
    const found = filterOptions.some((option) => normalize(option) === normalize(activeFilter));
    if (!found) setActiveFilter(filters.all);
  }, [activeFilter, filterOptions, filters.all]);

  useEffect(() => {
    if (isStatusAlias(activeFilter, "all")) setActiveFilter(filters.all);
    else if (isStatusAlias(activeFilter, "available")) setActiveFilter(filters.available);
    else if (isStatusAlias(activeFilter, "reserved")) setActiveFilter(filters.reserved);
    else if (isStatusAlias(activeFilter, "upcoming")) setActiveFilter(filters.upcoming);
    else if (isStatusAlias(activeFilter, "sold")) setActiveFilter(filters.sold);
  }, [activeFilter, filters]);

  const visibleProducts = useMemo(() => {
    const active = normalize(activeFilter);
    const normalizedSearch = normalize(searchTerm);

    return products.filter((product) => {
      const status = product.status ?? "available";
      const statusMatch =
        isStatusAlias(active, "all")
          ? true
          : isStatusAlias(active, "available")
            ? status === "available"
            : isStatusAlias(active, "reserved")
              ? status === "reserved"
              : isStatusAlias(active, "upcoming")
                ? status === "upcoming"
                : isStatusAlias(active, "sold")
                  ? status === "sold"
                  : [product.sport, product.productType, ...(product.tags ?? [])]
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

  const availableCount = products.filter((product) => (product.status ?? "available") === "available").length;

  const copy =
    locale === "en"
      ? {
          eyebrow: "Shop catalog",
          title: "Find collectibles by status, category and price",
          text: "Storefront view with practical filters and clear stock so every product is easy to find.",
          searchLabel: "Search products",
          searchPlaceholder: "Search player, team, set or collectible type",
          clear: "Clear",
          available: "available",
          visible: "visible",
          empty:
            "No results for the current filters. Change filters or contact us on WhatsApp to locate your exact item.",
        }
      : {
          eyebrow: "Catálogo de tienda",
          title: "Compra coleccionables por estado, categoría y precio",
          text: "Vista de tienda con filtros útiles y stock claro para encontrar cada pieza sin perder tiempo.",
          searchLabel: "Buscar productos",
          searchPlaceholder: "Buscar jugador, equipo, card set o tipo de pieza",
          clear: "Limpiar",
          available: "disponibles",
          visible: "visibles",
          empty:
            "No encontramos resultados con los filtros actuales. Cambia el filtro o escribe por WhatsApp para localizar la pieza exacta.",
        };

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1 className="text-4xl font-heading font-bold text-ink sm:text-5xl">{copy.title}</h1>
        <p className="max-w-3xl text-sm text-muted">{copy.text}</p>
      </header>

      <div className="glass-card grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <label className="relative block">
          <span className="sr-only">{copy.searchLabel}</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="focus-ring w-full rounded-full border border-line bg-white px-5 py-3 text-sm text-ink placeholder:text-muted"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:border-blue/35 hover:text-blue"
            >
              {copy.clear}
            </button>
          ) : null}
        </label>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          <span className="rounded-full border border-green/25 bg-green/10 px-3 py-1 text-green">
            {availableCount} {copy.available}
          </span>
          <span className="rounded-full border border-line bg-white px-3 py-1">
            {visibleProducts.length} {copy.visible}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const active = normalize(option) === normalize(activeFilter);
          return (
            <button
              key={option}
              type="button"
              onClick={() => setActiveFilter(option)}
              className={clsx(
                "focus-ring rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em]",
                active ? "border-blue bg-blue text-white shadow-glow" : "border-line bg-white text-muted hover:border-blue/35 hover:text-blue",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {visibleProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} locale={locale} priority={index < 2} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <p className="text-sm text-muted">{copy.empty}</p>
        </div>
      )}
    </section>
  );
}

