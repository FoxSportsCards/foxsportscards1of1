import Image from "next/image";
import Link from "next/link";
import { getServerLocale } from "@/lib/getServerLocale";
import { formatLocaleTag, type Locale } from "@/lib/locale";
import { getProductPrices } from "@/lib/pricing";
import { getAllProducts } from "@/lib/products";

export const revalidate = 180;

function formatReleaseDate(dateString: string | null | undefined, locale: Locale) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return {
    full: date.toLocaleDateString(formatLocaleTag(locale), {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    badge: date
      .toLocaleDateString(formatLocaleTag(locale), {
        day: "2-digit",
        month: "short",
      })
      .toUpperCase(),
    timestamp: date.getTime(),
  };
}

export default async function LanzamientosPage() {
  const locale = getServerLocale();
  const isEn = locale === "en";
  const products = await getAllProducts();
  const upcoming = products
    .filter((product) => product.status === "upcoming")
    .map((product) => ({
      product,
      releaseInfo: formatReleaseDate(product.releaseDate, locale),
    }))
    .sort(
      (a, b) =>
        (a.releaseInfo?.timestamp ?? Number.POSITIVE_INFINITY) -
        (b.releaseInfo?.timestamp ?? Number.POSITIVE_INFINITY),
    );

  return (
    <section className="container py-14 sm:py-16">
      <header className="max-w-3xl space-y-4">
        <span className="eyebrow">{isEn ? "Drop calendar" : "Calendario de drops"}</span>
        <h1 className="text-4xl font-heading font-bold text-ink sm:text-5xl">
          {isEn ? "Upcoming releases" : "Próximos lanzamientos"}
        </h1>
        <p className="text-sm text-muted">
          {isEn
            ? "Reserve future pieces from this page. Every release includes date, product page and direct WhatsApp access."
            : "Reserva piezas futuras desde esta página. Cada lanzamiento incluye fecha, ficha y acceso directo a WhatsApp."}
        </p>
      </header>

      {upcoming.length === 0 ? (
        <div className="glass-card mt-12 p-10 text-center text-sm text-muted">
          {isEn
            ? "No upcoming releases published yet. Message us on WhatsApp to join the alerts list."
            : "No hay lanzamientos publicados por ahora. Escribe por WhatsApp para unirte a la lista de alertas."}
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.map(({ product, releaseInfo }) => {
            const cover = product.images[0]?.url ?? "/hero.jpg";
            const alt = product.images[0]?.alt ?? product.title;
            const prices = getProductPrices(product, locale);

            return (
              <article
                key={product.slug}
                className="group overflow-hidden rounded-3xl border border-line bg-white shadow-soft"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={cover}
                    alt={alt}
                    fill
                    sizes="(min-width: 1280px) 27vw, (min-width: 768px) 43vw, 90vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-4 top-4 rounded-full border border-blue/30 bg-blue/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue">
                    {isEn ? "Upcoming drop" : "Próximo drop"}
                  </span>
                  {releaseInfo?.badge ? (
                    <span className="absolute right-4 top-4 rounded-full border border-green/30 bg-green/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-green">
                      {releaseInfo.badge}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {product.sport ?? product.productType ?? (isEn ? "Collectible" : "Coleccionable")}
                    </p>
                    <h2 className="mt-2 text-xl font-heading font-bold text-ink">{product.title}</h2>
                    <p className="mt-2 text-sm text-muted">
                      {product.shortDescription ??
                        (isEn
                          ? "Limited launch for registered buyers."
                          : "Lanzamiento limitado para compradores registrados.")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-line bg-surface-elevated px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {isEn ? "Estimated price" : "Ticket estimado"}
                    </p>
                    <p className="mt-1 text-lg font-heading font-bold text-ink">{prices.primary}</p>
                    {prices.secondary ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{prices.secondary}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted">
                      {isEn ? "Date" : "Fecha"}:{" "}
                      {releaseInfo?.full ?? (isEn ? "To be confirmed" : "Por confirmar")}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Link href={`/producto/${product.slug}`} className="btn-ghost">
                      {isEn ? "View item" : "Ver ficha"}
                    </Link>
                    <a
                      href={`https://wa.me/18492617328?text=${encodeURIComponent(
                        isEn
                          ? `Hi, I want to reserve ${product.title}.`
                          : `Hola, quiero reservar ${product.title}.`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                    >
                      {isEn ? "Reserve" : "Reservar"}
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

