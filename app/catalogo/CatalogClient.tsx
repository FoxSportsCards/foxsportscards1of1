"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import ProductCard from "@/components/ProductCard";
import type { Locale } from "@/lib/locale";
import { getProductTypeLabel, getSportLabel } from "@/lib/productLabels";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
  locale?: Locale;
  initialFilter?: string;
  page?: number;
  pageSize?: number;
  totalProducts?: number;
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

export function CatalogClient({
  products,
  locale = "es",
  initialFilter = "Todos",
  page = 1,
  pageSize = 24,
  totalProducts = products.length,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters = STATUS_FILTERS[locale];

  const statusOptions = useMemo(
    () => [filters.all, filters.available, filters.reserved, filters.upcoming, filters.sold],
    [filters],
  );

  const dynamicFilterOptions = useMemo(() => {
    const collected = new Map<string, string>();
    products.forEach((product) => {
      const sportLabel = getSportLabel(product.sport, locale);
      const productTypeLabel = getProductTypeLabel(product.productType, locale);
      if (sportLabel) collected.set(normalize(sportLabel), sportLabel);
      if (productTypeLabel) collected.set(normalize(productTypeLabel), productTypeLabel);
      (product.tags ?? []).forEach((tag) => {
        if (tag) collected.set(normalize(tag), tag);
      });
    });

    const statusSet = new Set(statusOptions.map((option) => normalize(option)));
    return Array.from(collected.values())
      .filter((option) => !statusSet.has(normalize(option)))
      .sort((a, b) => a.localeCompare(b));
  }, [products, statusOptions, locale]);

  const filterOptions = useMemo(() => {
    const merged = [...statusOptions, ...dynamicFilterOptions];
    return merged.filter(
      (option, index) => merged.findIndex((value) => normalize(value) === normalize(option)) === index,
    );
  }, [dynamicFilterOptions, statusOptions]);

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
                  : [
                      product.sport,
                      product.productType,
                      getSportLabel(product.sport, locale),
                      getProductTypeLabel(product.productType, locale),
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
  }, [products, activeFilter, searchTerm, locale]);

  const availableCount = products.filter((product) => (product.status ?? "available") === "available").length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const activeIsAll = isStatusAlias(activeFilter, "all");

  const copy =
    locale === "en"
      ? {
          eyebrow: "Shop catalog",
          title: "Find collectibles by status, category and price",
          text: "Practical filters, clear availability and direct prices so every product is easy to find.",
          searchLabel: "Search products",
          searchPlaceholder: "Search player, team, set or collectible type",
          clear: "Clear",
          filters: "Filters",
          closeFilters: "Close",
          status: "Status",
          categories: "Categories",
          activeFilter: "Active filter",
          allFilters: "All products",
          noExtraFilters: "No extra categories available on this page.",
          available: "available",
          visible: "visible",
          page: "page",
          of: "of",
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
          filters: "Filtros",
          closeFilters: "Cerrar",
          status: "Estado",
          categories: "Categorías",
          activeFilter: "Filtro activo",
          allFilters: "Todos los productos",
          noExtraFilters: "No hay categorías extra en esta página.",
          available: "disponibles",
          visible: "visibles",
          page: "página",
          of: "de",
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

      <div className="relative">
        <div className="glass-card grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
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
            <span className="rounded-full border border-line bg-white px-3 py-1">
              {copy.page} {page} {copy.of} {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              aria-expanded={filtersOpen}
              className={clsx(
                "focus-ring inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] shadow-soft",
                filtersOpen || !activeIsAll
                  ? "border-blue bg-blue text-white"
                  : "border-line bg-white text-muted hover:border-blue/35 hover:text-blue",
              )}
            >
              {copy.filters}
              {!activeIsAll ? <span className="hidden sm:inline">· {activeFilter}</span> : null}
            </button>
          </div>
        </div>

        {filtersOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 max-h-[68vh] overflow-y-auto rounded-[2rem] border border-line bg-white p-4 shadow-glass sm:max-h-[520px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue">{copy.filters}</p>
                <p className="mt-1 text-sm text-muted">
                  {copy.activeFilter}: {activeIsAll ? copy.allFilters : activeFilter}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!activeIsAll ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter(filters.all);
                      setFiltersOpen(false);
                    }}
                    className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:border-blue/35 hover:text-blue"
                  >
                    {copy.clear}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="focus-ring rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:border-blue/35 hover:text-blue"
                >
                  {copy.closeFilters}
                </button>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{copy.status}</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {statusOptions.map((option) => {
                    const active = normalize(option) === normalize(activeFilter);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setActiveFilter(option);
                          setFiltersOpen(false);
                        }}
                        className={clsx(
                          "focus-ring rounded-2xl border px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em]",
                          active
                            ? "border-blue bg-blue text-white shadow-glow"
                            : "border-line bg-surface text-muted hover:border-blue/35 hover:text-blue",
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{copy.categories}</p>
                {dynamicFilterOptions.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {dynamicFilterOptions.map((option) => {
                      const active = normalize(option) === normalize(activeFilter);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setActiveFilter(option);
                            setFiltersOpen(false);
                          }}
                          className={clsx(
                            "focus-ring rounded-2xl border px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em]",
                            active
                              ? "border-blue bg-blue text-white shadow-glow"
                              : "border-line bg-surface text-muted hover:border-blue/35 hover:text-blue",
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-line bg-surface px-4 py-5 text-sm text-muted">
                    {copy.noExtraFilters}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {!activeIsAll ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-blue/20 bg-blue/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue">
            {copy.activeFilter}: {activeFilter}
          </span>
          <button
            type="button"
            onClick={() => setActiveFilter(filters.all)}
            className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted hover:border-blue/35 hover:text-blue"
          >
            {copy.clear}
          </button>
        </div>
      ) : null}
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

      {totalPages > 1 ? (
        <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Paginación del catálogo">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((nextPage) => (
            <Link
              key={nextPage}
              href={`/catalogo?pagina=${nextPage}`}
              className={clsx(
                "focus-ring inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold",
                nextPage === page
                  ? "border-blue bg-blue text-white"
                  : "border-line bg-white text-muted hover:border-blue/35 hover:text-blue",
              )}
            >
              {nextPage}
            </Link>
          ))}
        </nav>
      ) : null}
    </section>
  );
}
