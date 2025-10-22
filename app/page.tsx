import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/pricing";
import { getAllProducts } from "@/lib/products";
import { getHomepageContent } from "@/lib/homeContent";
import type { Product } from "@/types/product";
import type { HomeDrop } from "@/types/home";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";
export const preferredRegion = "auto";

const stats = [
  { label: "Piezas certificadas", value: "120+" },
  { label: "Graded 9.5 o más", value: "85%" },
  { label: "Envíos asegurados", value: "RD & Intl" },
];

const collections = [
  {
    title: "NBA Grails",
    description: "Rookies serializados, autos on-card y parallels SSP listos para grading o vault.",
    metric: "Top players: Luka • Wemby • MJ",
    href: "/catalogo?deporte=nba",
  },
  {
    title: "TCG Masterpieces",
    description: "Charizard, Lugia y piezas exclusivas PSA 10/ BGS 9.5 con historial transparente.",
    metric: "Lotes curados · Sello original",
    href: "/catalogo?tipo=tcg",
  },
  {
    title: "Memorabilia Firmada",
    description: "Jerseys limited, balones certificados y fotos autografiadas con hologramas oficiales.",
    metric: "COA · Fanatics · Beckett",
    href: "/catalogo?tipo=memorabilia",
  },
];

type SegmentDefinition = {
  key: string;
  title: string;
  description: string;
  tags?: string[];
  includeFeatured?: boolean;
  limit?: number;
  statuses?: Array<NonNullable<Product["status"]>>;
  preventDuplicates?: boolean;
};

type Segment = SegmentDefinition & {
  items: Product[];
};

const SEGMENT_DEFINITIONS: SegmentDefinition[] = [
  {
    key: "top-drops",
    title: "Top drops de la semana",
    description: "Piezas marcadas en Sanity como destacadas o con lanzamiento cercano.",
    tags: ["top-drop", "destacado", "featured"],
    includeFeatured: true,
    limit: 4,
    statuses: ["available", "upcoming", "reserved"],
  },
  {
    key: "vintage",
    title: "Vintage & Legends",
    description: "Clásicos slabbed, numerados y leyendas históricas para vitrinas selectas.",
    tags: ["vintage", "legend", "retro"],
    limit: 4,
    statuses: ["available", "reserved"],
  },
  {
    key: "modern",
    title: "Modern Hits",
    description: "Rookies, paralelos SSP y grails recientes listos para calificación.",
    tags: ["modern", "rookie", "modern-grail"],
    limit: 4,
    statuses: ["available", "reserved", "upcoming"],
  },
];

export default async function Page() {
  const [products, homepage] = await Promise.all([getAllProducts(), getHomepageContent()]);
  const { drops, testimonials } = homepage;
  const formatDropBadge = (value?: string | null) => {
    if (!value) return "POR DEFINIR";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "POR DEFINIR";
    return date
      .toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "short",
      })
      .toUpperCase();
  };

  const formatDropFullDate = (value?: string | null) => {
    if (!value) return "Fecha por confirmar";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Fecha por confirmar";
    return date.toLocaleDateString("es-DO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resolveDropCta = (drop: HomeDrop | null) => {
    if (!drop) return null;
    const rawHref = drop.ctaHref?.trim();
    const href = rawHref && rawHref.length > 0 ? rawHref : "https://wa.me/18492617328";
    return {
      href,
      label: drop.ctaLabel ?? "Reservar cupo",
      external: /^https?:\/\//i.test(href),
    };
  };

  const heroBannerDrop = drops.find((drop) => drop.showInBanner) ?? null;
  const heroBannerHref =
    heroBannerDrop && heroBannerDrop.ctaHref && heroBannerDrop.ctaHref.trim().length > 0
      ? heroBannerDrop.ctaHref.trim()
      : "#agenda-drops";
  const heroBannerIsExternal = heroBannerDrop ? /^https?:\/\//i.test(heroBannerHref) : false;
  const heroBannerCtaLabel = heroBannerDrop?.ctaLabel ?? "Ver agenda";

  const primaryCalendarDrop = (heroBannerDrop ?? drops[0]) ?? null;
  const secondaryCalendarDrops = primaryCalendarDrop
    ? drops.filter((drop) => drop.id !== primaryCalendarDrop.id)
    : [];
  const primaryCalendarCta = resolveDropCta(primaryCalendarDrop);

  const availableProducts = products.filter((product) => product.status !== "sold");
  const featuredProducts = products.filter((product) => product.featured);

  const spotlight =
    featuredProducts.find((product) => product.status !== "sold") ??
    availableProducts.find((product) => product.status !== "sold") ??
    featuredProducts[0] ??
    products[0] ??
    null;

  const normalizeTag = (value: string) => value.trim().toLowerCase();
  const usedSlugs = new Set<string>();
  if (spotlight) {
    usedSlugs.add(spotlight.slug);
  }

  const segments: Segment[] = SEGMENT_DEFINITIONS.map((definition) => {
    const allowedStatuses =
      definition.statuses ?? (["available"] as Array<NonNullable<Product["status"]>>);
    const normalizedTags = (definition.tags ?? []).map(normalizeTag);

    const items = products
      .filter((product) => {
        const status = (product.status ?? "available") as NonNullable<Product["status"]>;
        if (!allowedStatuses.includes(status)) return false;
        if (definition.preventDuplicates !== false && usedSlugs.has(product.slug)) return false;

        const tags = (product.tags ?? []).map(normalizeTag);
        const matchesTags = normalizedTags.length ? normalizedTags.some((tag) => tags.includes(tag)) : false;
        const matchesFeatured = definition.includeFeatured && product.featured;

        return matchesTags || matchesFeatured;
      })
      .slice(0, definition.limit ?? 4);

    if (!items.length) {
      return null;
    }

    if (definition.preventDuplicates !== false) {
      items.forEach((item) => usedSlugs.add(item.slug));
    }

    return { ...definition, items };
  }).filter((segment): segment is Segment => segment !== null);

  const gallery = availableProducts.filter((product) => !usedSlugs.has(product.slug)).slice(0, 8);

  const heroStatusLabel =
    spotlight?.status === "sold"
      ? "No disponible"
      : spotlight?.status === "reserved"
        ? "Reservado"
        : spotlight?.status === "upcoming"
          ? "Próximo drop"
          : "Disponible";

  const heroReleaseLabel =
    spotlight?.status === "upcoming" && spotlight.releaseDate
      ? new Date(spotlight.releaseDate).toLocaleDateString("es-DO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  const renderProductCard = (product: Product) => {
    const cover = product.images[0]?.url ?? "/hero.jpg";
    const alt = product.images[0]?.alt ?? product.title;
    const status = product.status ?? "available";

    return (
      <Link
        key={product.slug}
        href={`/producto/${product.slug}`}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-soft transition hover:-translate-y-1 hover:border-white/20 hover:shadow-glow"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={cover}
            alt={alt}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 35vw, 80vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {status !== "available" && (
            <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white">
              {status === "reserved" ? "Reservado" : status === "sold" ? "Vendido" : "Próximo"}
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
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="container relative grid gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            {heroBannerDrop && (
              <a
                href={heroBannerHref}
                target={heroBannerIsExternal ? "_blank" : undefined}
                rel={heroBannerIsExternal ? "noreferrer" : undefined}
                className="group relative overflow-hidden rounded-3xl border border-accent/35 bg-gradient-to-r from-accent/25 via-accent/10 to-transparent px-4 py-4 text-white shadow-[0_12px_40px_rgba(255,215,0,0.15)] transition hover:border-accent/60 hover:shadow-[0_20px_60px_rgba(255,215,0,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-accent">
                      {formatDropBadge(heroBannerDrop.scheduledAt)}
                    </span>
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.35em] text-accent/80">
                        {heroBannerDrop.statusLabel}
                      </p>
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white">
                        {heroBannerDrop.title}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                        {formatDropFullDate(heroBannerDrop.scheduledAt)}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-black transition group-hover:bg-white/25 group-hover:text-black sm:self-auto">
                    {heroBannerCtaLabel}
                    <span aria-hidden>→</span>
                  </span>
                </div>
                <span className="pointer-events-none absolute -right-10 top-1/2 hidden h-24 w-24 -translate-y-1/2 rounded-full bg-accent/40 blur-3xl sm:block" />
              </a>
            )}
            <span className="eyebrow">Vault curado • Ediciones limitadas</span>
            <h1 className="text-4xl font-heading font-semibold leading-tight text-white sm:text-5xl md:text-[56px]">
              Coleccionables premium, autenticidad garantizada.
            </h1>
            <p className="max-w-xl text-base text-muted sm:text-lg">
              Seleccionamos cartas deportivas, TCG y memorabilia certificada para coleccionistas que exigen piezas únicas.
              Accede a drops exclusivos, asesoría concierge y envíos asegurados en República Dominicana.
            </p>
            <Link
              href="/lanzamientos"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/20 bg-gradient-to-r from-accent via-[#f4cf73] to-accent px-6 py-3 text-sm font-semibold text-black shadow-glow transition hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70 mix-blend-screen animate-shimmer" />
              <span className="relative flex items-center gap-3">
                <span>Explorar próximos drops</span>
                <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/90">
                  Nuevo
                </span>
              </span>
            </Link>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black shadow-glow transition hover:bg-accent-soft"
              >
                Ver catálogo completo
              </Link>
              <a
                href="https://www.instagram.com/foxsportscards1of1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-muted transition hover:border-white/40 hover:text-white"
              >
                Ver vitrina diaria
              </a>
            </div>
            <div className="grid gap-4 pt-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center shadow-soft backdrop-blur"
                >
                  <p className="text-2xl font-heading text-accent">{stat.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          {spotlight && (
            <Link
              href={`/producto/${spotlight.slug}`}
              className="group relative block overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-4 shadow-glass transition hover:border-white/20 hover:shadow-glow"
            >
              <div className="absolute -left-16 top-10 hidden h-32 w-32 rounded-full bg-accent-secondary/30 blur-3xl md:block" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {spotlight.heroVideoUrl ? (
                    <video
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      poster={spotlight.images[0]?.url ?? "/hero.jpg"}
                    >
                      <source src={spotlight.heroVideoUrl} />
                    </video>
                  ) : (
                    <Image
                      src={spotlight.images[0]?.url ?? "/hero.jpg"}
                      alt={spotlight.images[0]?.alt ?? spotlight.title}
                      fill
                      sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 45vw, 80vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  )}
                  <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white">
                    Spotlight
                  </span>
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                      {spotlight.sport ?? spotlight.productType ?? "Coleccionable"}
                    </p>
                    <p className="text-xs text-muted">
                      {spotlight.year ? `Edición ${spotlight.year}` : spotlight.rarity ?? ""}
                    </p>
                  </div>
                  <h2 className="text-xl font-heading text-white">{spotlight.title}</h2>
                  <div className="flex items-center justify-between text-sm font-semibold text-accent">
                    <span>{formatCurrency(spotlight.price, spotlight.currency)}</span>
                    <span className="text-xs uppercase tracking-[0.35em] text-muted">{heroStatusLabel}</span>
                  </div>
                  <p className="text-sm text-muted">
                    {spotlight.shortDescription ?? "Pieza verificada. Incluye concierge y envío asegurado."}
                  </p>
                  {heroReleaseLabel && (
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Disponible desde {heroReleaseLabel}
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute bottom-6 left-1/2 hidden h-24 w-32 -translate-x-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />
            </Link>
          )}
        </div>
      </section>

      <section id="agenda-drops" className="relative border-b border-white/5 bg-surface/60 py-16 backdrop-blur">
        <div className="container space-y-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="eyebrow">Calendario de drops</span>
              <h2 className="text-3xl font-heading font-semibold text-white">Agenda tus próximos movimientos</h2>
              <p className="max-w-2xl text-sm text-muted">
                Drops privados, breaks boutique y showcases virtuales. Los cupos son limitados y cada fecha incluye concierge en vivo.
              </p>
            </div>
            {primaryCalendarCta && (
              <a
                href={primaryCalendarCta.href}
                target={primaryCalendarCta.external ? "_blank" : undefined}
                rel={primaryCalendarCta.external ? "noreferrer" : undefined}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-glow transition hover:bg-accent-soft"
              >
                {primaryCalendarCta.label}
              </a>
            )}
          </div>
          {primaryCalendarDrop ? (
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-4xl border border-accent/35 bg-gradient-to-br from-accent/25 via-transparent to-black/30 p-6 shadow-[0_25px_80px_rgba(255,215,0,0.15)] sm:p-8">
                <div className="absolute -left-20 top-1/2 hidden h-40 w-40 -translate-y-1/2 rounded-full bg-accent/40 blur-3xl lg:block" />
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-accent">
                    <span className="rounded-full bg-black/50 px-4 py-1 text-accent">{formatDropBadge(primaryCalendarDrop.scheduledAt)}</span>
                    <span className="text-white/70">{primaryCalendarDrop.statusLabel}</span>
                  </div>
                  <h3 className="text-2xl font-heading font-semibold uppercase tracking-[0.22em] text-white sm:text-3xl">
                    {primaryCalendarDrop.title}
                  </h3>
                  <p className="max-w-2xl text-sm text-white/80">{primaryCalendarDrop.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70">
                    <span>{formatDropFullDate(primaryCalendarDrop.scheduledAt)}</span>
                  </div>
                  {primaryCalendarCta && (
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={primaryCalendarCta.href}
                        target={primaryCalendarCta.external ? "_blank" : undefined}
                        rel={primaryCalendarCta.external ? "noreferrer" : undefined}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:opacity-85"
                      >
                        {primaryCalendarCta.label}
                        <span aria-hidden>→</span>
                      </a>
                      <a
                        href="https://wa.me/18492617328"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/50 hover:text-white"
                      >
                        Concierge inmediato
                      </a>
                    </div>
                  )}
                </div>
              </div>
              {secondaryCalendarDrops.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-1 pt-1 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible">
                  {secondaryCalendarDrops.map((drop) => {
                    const cta = resolveDropCta(drop);
                    return (
                      <div
                        key={drop.id}
                        className="min-w-[260px] flex-1 snap-start rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-muted shadow-soft transition hover:border-accent/40 hover:shadow-glow lg:min-w-0"
                      >
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-accent">
                          <span>{formatDropBadge(drop.scheduledAt)}</span>
                          <span className="text-white/60">{drop.statusLabel}</span>
                        </div>
                        <h4 className="mt-4 text-lg font-heading font-semibold text-white">{drop.title}</h4>
                        <p className="mt-3 text-sm text-muted/90">{drop.description}</p>
                        <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-white/50">
                          {formatDropFullDate(drop.scheduledAt)}
                        </p>
                        {cta && (
                          <a
                            href={cta.href}
                            target={cta.external ? "_blank" : undefined}
                            rel={cta.external ? "noreferrer" : undefined}
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent transition hover:bg-accent/30"
                          >
                            {cta.label}
                            <span aria-hidden>→</span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-muted">
              Añade drops destacados desde Sanity en la colección “Drop destacado” para que aparezcan aquí automáticamente.
            </div>
          )}
        </div>
      </section>

      <section className="relative py-16">
        <div className="container space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Selección semanal</span>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-white">Nuevas llegadas al vault</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Singles de alto impacto, cajas selladas y memorabilia lista para tu vitrina. Actualizamos el catálogo cada
                semana con piezas verificadas y grading premium.
              </p>
            </div>
            <Link
              href="/lanzamientos"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:text-white"
            >
              Ver calendario de drops
            </Link>
          </div>
          {segments.length > 0 ? (
            <div className="space-y-12">
              {segments.map((segment) => (
                <div key={segment.key} className="space-y-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-white">{segment.title}</h3>
                      <p className="text-sm text-muted">{segment.description}</p>
                    </div>
                    <Link
                      href="/catalogo"
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:text-white"
                    >
                      Ver en el catálogo
                    </Link>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {segment.items.map((product) => renderProductCard(product))}
                  </div>
                </div>
              ))}
              {gallery.length > 0 && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-white">Más piezas disponibles</h3>
                      <p className="text-sm text-muted">
                        Explora también estas incorporaciones recientes dentro del vault.
                      </p>
                    </div>
                    <Link
                      href="/catalogo"
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:text-white"
                    >
                      Ver todo
                    </Link>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {gallery.map((product) => renderProductCard(product))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gallery.map((product) => renderProductCard(product))}
            </div>
          )}
        </div>
      </section>

      <section className="relative border-y border-white/5 bg-surface/60 py-16 backdrop-blur">
        <div className="container space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <span className="eyebrow">Colecciones curadas</span>
              <h2 className="text-3xl font-heading font-semibold text-white">Tres caminos para elevar tu vitrina</h2>
              <p className="max-w-2xl text-sm text-muted">
                Seleccionamos lotes por deporte y formato para que encuentres tu próxima pieza gem mint o ese grail que lleva
                meses en tu radar.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.title}
                href={collection.href}
                className="group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-soft transition hover:border-white/20 hover:shadow-glow"
              >
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-[0.3em] text-muted">Colección</span>
                  <h3 className="text-2xl font-heading text-white group-hover:text-accent">{collection.title}</h3>
                  <p className="text-sm text-muted">{collection.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                  <span>{collection.metric}</span>
                  <span className="text-accent">Explorar →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/5 bg-surface/60 py-16">
        <div className="container space-y-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="space-y-5">
              <span className="eyebrow">Nuestra historia</span>
              <h2 className="text-3xl font-heading font-semibold text-white">De la pasión por el deporte al vault premium.</h2>
              <p className="text-sm text-muted">
                foxsportscards1of1 nace de anos coleccionando, viajando a shows internacionales y construyendo relaciones con dealers,
                breakers y empresas de grading. Curamos cada pieza con criterios de inversión y storytelling para que cada compra
                sea una experiencia memorable.
              </p>
              <p className="text-sm text-muted">
                Ofrecemos concierge personalizado, autenticación, logística de envío y guías para potenciar tus colecciones a largo
                plazo. Creamos comunidad a través de drops privados, workshops y contenido educativo.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sobre"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-white/40 hover:text-white"
                >
                  Conoce el equipo →
                </Link>
                <Link
                  href="/preguntas"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-white/40 hover:text-white"
                >
                  FAQ & logística →
                </Link>
              </div>
            </div>
            <div className="grid gap-4 rounded-4xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-soft">
              <h3 className="text-sm uppercase tracking-[0.3em] text-muted">Concierge en números</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-background/70 p-5">
                  <p className="text-3xl font-heading text-accent">300+</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">Clientes atendidos</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-background/70 p-5">
                  <p className="text-3xl font-heading text-accent">48h</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">Promedio de entrega</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-background/70 p-5">
                  <p className="text-3xl font-heading text-accent">95%</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">Retención de clientes</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-background/70 p-5">
                  <p className="text-3xl font-heading text-accent">24/7</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">Soporte WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="container space-y-10">
          <div className="space-y-3 text-center">
            <span className="eyebrow mx-auto">Testimonios concierge</span>
            <h2 className="text-3xl font-heading font-semibold text-white">Lo que dicen nuestros coleccionistas</h2>
            <p className="mx-auto max-w-2xl text-sm text-muted">
              Construimos relaciones de largo plazo. Cada entrega va acompañada de transparencia, asesoría y seguimiento personalizado.
            </p>
          </div>
          {testimonials.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-muted shadow-soft"
                >
                  <p>“{testimonial.quote}”</p>
                  <p className="mt-6 text-xs uppercase tracking-[0.3em] text-accent">
                    {testimonial.author}
                    {testimonial.location ? ` • ${testimonial.location}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-muted">
              Crea testimonios en Sanity para que aparezcan en esta sección. Cada documento nuevo se sincroniza automáticamente.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
