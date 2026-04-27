import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import HeroMedia from "@/components/HeroMedia";
import WhatsAppBuy from "@/components/WhatsAppBuy";
import { getServerLocale } from "@/lib/getServerLocale";
import { formatLocaleTag, type Locale } from "@/lib/locale";
import { getProductPrices } from "@/lib/pricing";
import { getProductCategoryLabel } from "@/lib/productLabels";
import { getAllProducts } from "@/lib/products";

export const runtime = "edge";
export const revalidate = 180;

function toTimestamp(value: string | null | undefined): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function formatRelease(value: string | null | undefined, locale: Locale): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(formatLocaleTag(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusText(status: string | null | undefined, locale: Locale) {
  if (locale === "en") {
    if (status === "reserved") return "Reserved";
    if (status === "upcoming") return "Upcoming";
    if (status === "sold") return "Sold";
    return "Available";
  }
  if (status === "reserved") return "Reservado";
  if (status === "upcoming") return "Próximo";
  if (status === "sold") return "Vendido";
  return "Disponible";
}

export default async function HomePage() {
  const locale = getServerLocale();
  const isEn = locale === "en";

  const copy = isEn
    ? {
        heroEyebrow: "Trusted sports card store",
        heroTitle: "Premium collectibles with guaranteed authenticity.",
        heroText:
          "Find sports cards, Pokémon cards, signed jerseys, balls and memorabilia in a clear shop format with direct prices.",
        ctaPrimary: "Shop catalog",
        ctaSecondary: "See upcoming drops",
        trustPoints: [
          "Verified authenticity",
          "Direct and transparent pricing",
          "Insured shipping in DR",
          "Personal support",
        ],
        spotlightBadge: "Featured piece",
        spotlightFallback: "Top collectible ready for immediate purchase.",
        categoriesEyebrow: "Live categories",
        categoriesTitle: "Shop by collection style",
        categoriesCta: "View full catalog",
        piecesLabel: "pieces",
        categoryCardText: "Open category and check live stock.",
        noCategories: "No categories available at the moment.",
        topEyebrow: "Top picks",
        topTitle: "Ready to buy today",
        topCta: "Open full catalog",
        noTop: "No featured products available right now.",
        releasesEyebrow: "Drop calendar",
        releasesTitle: "Upcoming releases",
        releasesCta: "See full calendar",
        reserve: "Reserve",
        releaseFallback: "Limited drop for active collectors.",
        releaseDateFallback: "Date to be confirmed",
        noReleases: "No scheduled releases yet. Ask us on WhatsApp for priority alerts.",
        processEyebrow: "Simple process",
        processTitle: "A clear way to buy collectibles",
        processText:
          "Products, prices, availability and checkout are organized so you can decide quickly from any device.",
        steps: [
          {
            title: "Browse",
            text: "Filter by sport, type or status and find available pieces in seconds.",
          },
          {
            title: "Add",
            text: "Save items to cart or start a direct purchase from the product page.",
          },
          {
            title: "Receive",
            text: "We coordinate payment and insured delivery until your order arrives.",
          },
        ],
        upcomingDrop: "Upcoming drop",
        productCardCta: "View item",
      }
    : {
        heroEyebrow: "Tienda confiable de sports cards",
        heroTitle: "Coleccionables premium, autenticidad garantizada.",
        heroText:
          "Compra sports cards, cartas Pokémon, jerseys firmados, pelotas y memorabilia con fotos claras y precio directo.",
        ctaPrimary: "Ver catálogo",
        ctaSecondary: "Ver próximos drops",
        trustPoints: [
          "Autenticidad verificada",
          "Precios claros y directos",
          "Envíos asegurados en RD",
          "Atención personalizada",
        ],
        spotlightBadge: "Pieza destacada",
        spotlightFallback: "Selección premium lista para compra inmediata.",
        categoriesEyebrow: "Categorías activas",
        categoriesTitle: "Compra por estilo de colección",
        categoriesCta: "Ver catálogo completo",
        piecesLabel: "piezas",
        categoryCardText: "Entrar a la categoría y ver stock en vivo.",
        noCategories: "No hay categorías disponibles por ahora.",
        topEyebrow: "Top de venta",
        topTitle: "Piezas listas para comprar hoy",
        topCta: "Abrir catálogo completo",
        noTop: "No hay productos destacados disponibles en este momento.",
        releasesEyebrow: "Calendario de drops",
        releasesTitle: "Próximos lanzamientos",
        releasesCta: "Ver calendario completo",
        reserve: "Reservar",
        releaseFallback: "Drop limitado para coleccionistas activos.",
        releaseDateFallback: "Fecha por definir",
        noReleases: "No hay lanzamientos programados. Solicita alertas personalizadas por WhatsApp.",
        processEyebrow: "Proceso simple",
        processTitle: "Una forma clara de comprar coleccionables",
        processText:
          "Productos, precios, disponibilidad y compra están organizados para decidir rápido desde cualquier dispositivo.",
        steps: [
          {
            title: "Explora",
            text: "Filtra por deporte, tipo o estado y encuentra piezas disponibles en segundos.",
          },
          {
            title: "Agrega",
            text: "Guarda tus piezas en carrito o inicia una compra directa desde la ficha del producto.",
          },
          {
            title: "Recibe",
            text: "Coordinamos pago y envío asegurado hasta entregar tu compra.",
          },
        ],
        upcomingDrop: "Próximo drop",
        productCardCta: "Ver pieza",
      };

  const products = await getAllProducts();

  const available = products.filter((product) => product.status !== "sold");
  const featuredPoolCandidates = available.filter((product) => product.featured);
  const featuredPool =
    featuredPoolCandidates.length > 0
      ? featuredPoolCandidates
      : available.filter((product) => product.status === "available");
  const spotlight = featuredPool[0] ?? available[0] ?? products[0] ?? null;

  const featuredProducts =
    featuredPool.length > 0 ? featuredPool.slice(0, 8) : available.slice(0, 8);

  const upcomingProducts = products
    .filter((product) => product.status === "upcoming")
    .sort((a, b) => toTimestamp(a.releaseDate) - toTimestamp(b.releaseDate))
    .slice(0, 3);

  const categoryEntries = Array.from(
    available.reduce((map, product) => {
      const key = product.productType ?? product.sport;
      if (!key) return map;
      const current = map.get(key);
      const label = getProductCategoryLabel(product, locale);
      map.set(key, { label, count: (current?.count ?? 0) + 1 });
      return map;
    }, new Map<string, { label: string; count: number }>()),
  )
    .map(([value, entry]) => ({ value, ...entry }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <>
      <section className="relative flex min-h-[calc(100dvh-4.75rem)] items-center overflow-hidden border-b border-line/80 py-8 sm:min-h-[calc(100dvh-5.4rem)] sm:py-10 lg:min-h-[calc(100dvh-6rem)] lg:py-12">
        <div className="pointer-events-none absolute inset-0">
          <HeroMedia
            poster="/videos/hero-poster.jpg"
            desktopSrc="/videos/hero-desktop.mp4"
            mobileSrc="/videos/hero-mobile.mp4"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-black/30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/84 via-black/58 to-black/24 md:from-black/78 md:via-black/48 md:to-black/14" />
        <div className="pointer-events-none absolute inset-0 bg-hero-gradient opacity-30" />
        <div className="container relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,330px)] lg:items-center">
          <div className="max-w-2xl space-y-6">
            <span className="eyebrow">{copy.heroEyebrow}</span>
            <h1 className="max-w-3xl text-4xl font-heading font-black leading-tight text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.48)] sm:text-5xl">
              {copy.heroTitle}
            </h1>
            <p className="max-w-2xl text-base font-medium text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.44)]">
              {copy.heroText}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/catalogo" className="btn-primary">
                {copy.ctaPrimary}
              </Link>
              <Link href="/lanzamientos" className="btn-secondary">
                {copy.ctaSecondary}
              </Link>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {copy.trustPoints.map((point, index) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-full border border-white/35 bg-black/22 px-4 py-2.5 backdrop-blur-[2px]"
                >
                  <span
                    className={
                      index % 3 === 0
                        ? "status-dot-blue"
                        : index % 3 === 1
                          ? "status-dot-green"
                          : "status-dot-red"
                    }
                  />
                  <p className="text-sm font-semibold text-white/95">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {spotlight ? (
            <Link
              href={`/producto/${spotlight.slug}`}
              className="group mx-auto w-full max-w-[310px] overflow-hidden rounded-3xl border border-white/35 bg-white/95 shadow-[0_18px_44px_rgba(8,17,38,0.3)] hover:border-blue/45 lg:justify-self-end"
            >
              <div className="relative h-[clamp(240px,44svh,430px)] overflow-hidden bg-surface-elevated">
                <Image
                  src={spotlight.images[0]?.url ?? "/hero.jpg"}
                  alt={spotlight.images[0]?.alt ?? spotlight.title}
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 24vw, 84vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  priority
                />
              </div>
              <div className="space-y-2.5 p-4">
                <span className="inline-flex rounded-full border border-blue/25 bg-blue/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue">
                  {copy.spotlightBadge}
                </span>
                <h2 className="line-clamp-2 text-lg font-heading font-bold text-ink">{spotlight.title}</h2>
                <p className="line-clamp-1 text-sm text-muted">
                  {spotlight.shortDescription ?? copy.spotlightFallback}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-heading font-bold text-ink">
                    {getProductPrices(spotlight, locale).primary}
                  </p>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    {getStatusText(spotlight.status, locale)}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-sm text-muted">
                {isEn
                  ? "There are no products available right now. Please check back soon."
                  : "No hay productos disponibles por ahora. Vuelve pronto para ver nuevas piezas."}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">{copy.categoriesEyebrow}</span>
            <h2 className="mt-3 text-3xl font-heading font-bold text-ink">{copy.categoriesTitle}</h2>
          </div>
          <Link href="/catalogo" className="btn-ghost">
            {copy.categoriesCta}
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categoryEntries.map((entry, index) => (
            <Link
              key={entry.value}
              href={`/catalogo?filtro=${encodeURIComponent(entry.label)}`}
              className="glass-card group border-line bg-white p-5 hover:border-blue/35"
            >
              <div className="flex items-center justify-between">
                <span
                  className={
                    index % 3 === 0
                      ? "status-dot-blue"
                      : index % 3 === 1
                        ? "status-dot-green"
                        : "status-dot-red"
                  }
                />
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  {entry.count} {copy.piecesLabel}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-heading font-bold text-ink">{entry.label}</h3>
              <p className="mt-2 text-sm text-muted">{copy.categoryCardText}</p>
            </Link>
          ))}
          {categoryEntries.length === 0 ? (
            <div className="glass-card p-6 text-sm text-muted md:col-span-2 xl:col-span-4">{copy.noCategories}</div>
          ) : null}
        </div>
      </section>

      <section className="border-y border-line/90 bg-white/70 py-14 sm:py-16">
        <div className="container">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">{copy.topEyebrow}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-ink">{copy.topTitle}</h2>
            </div>
            <Link href="/catalogo" className="btn-ghost">
              {copy.topCta}
            </Link>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.slug} product={product} locale={locale} priority={index < 2} />
            ))}
          </div>

          {featuredProducts.length === 0 ? (
            <div className="glass-card mt-8 p-8 text-center text-sm text-muted">{copy.noTop}</div>
          ) : null}
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">{copy.releasesEyebrow}</span>
            <h2 className="mt-3 text-3xl font-heading font-bold text-ink">{copy.releasesTitle}</h2>
          </div>
          <Link href="/lanzamientos" className="btn-ghost">
            {copy.releasesCta}
          </Link>
        </div>

        {upcomingProducts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {upcomingProducts.map((product) => (
              <article key={product.slug} className="glass-card border-blue/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">
                  {formatRelease(product.releaseDate, locale) ?? copy.releaseDateFallback}
                </p>
                <h3 className="mt-3 text-xl font-heading font-bold text-ink">{product.title}</h3>
                <p className="mt-2 text-sm text-muted">{product.shortDescription ?? copy.releaseFallback}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/producto/${product.slug}`} className="btn-ghost">
                    {copy.productCardCta}
                  </Link>
                  <WhatsAppBuy product={product} locale={locale} mode="reserve" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-sm text-muted">{copy.noReleases}</div>
        )}
      </section>

      <section className="border-t border-line/90 py-14 sm:py-16">
        <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-3">
            <span className="eyebrow">{copy.processEyebrow}</span>
            <h2 className="text-3xl font-heading font-bold text-ink">{copy.processTitle}</h2>
            <p className="text-sm text-muted">{copy.processText}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {copy.steps.map((step, index) => (
              <div key={step.title} className="glass-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {isEn ? `Step ${index + 1}` : `Paso ${index + 1}`}
                </p>
                <h3 className="mt-2 text-xl font-heading font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
