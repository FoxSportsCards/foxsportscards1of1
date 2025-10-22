import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/pricing";
import { getAllProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";
export const preferredRegion = "auto";

export default async function LanzamientosPage() {
  const products = await getAllProducts();
  const upcoming = products
    .filter((product) => product.status === "upcoming")
    .sort((a, b) => {
      const aYear = a.year ?? 0;
      const bYear = b.year ?? 0;
      return bYear - aYear;
    });

  return (
    <div className="container py-16">
      <header className="max-w-3xl space-y-4">
        <span className="eyebrow">Calendario oficial</span>
        <h1 className="text-4xl font-heading font-semibold text-white">Próximos lanzamientos</h1>
        <p className="text-sm text-muted">
          Presentamos drops exclusivos, breaks privados y memorabilia que está por llegar al vault. Cada pieza se anuncia
          con anticipación para que puedas reservarla con tu concierge.
        </p>
      </header>

      {upcoming.length === 0 ? (
        <div className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-muted">
          Aún no tenemos lanzamientos programados. Vuelve pronto o escríbenos por WhatsApp para recibir alertas personalizadas.
        </div>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.map((product) => {
            const cover = product.images[0]?.url ?? "/hero.jpg";
            const alt = product.images[0]?.alt ?? product.title;
            return (
              <article
                key={product.slug}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-soft transition hover:-translate-y-1 hover:border-white/25 hover:shadow-glow"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={cover}
                    alt={alt}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                    Próximo drop
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-5 p-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                      <span>{product.sport ?? product.productType ?? "Coleccionable"}</span>
                      {product.year && <span>{product.year}</span>}
                    </div>
                    <h2 className="text-lg font-heading font-semibold text-white">{product.title}</h2>
                    {product.shortDescription && <p className="text-sm text-muted">{product.shortDescription}</p>}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                      <span>Rarity</span>
                      <span>{product.rarity ?? "Limitado"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                      <span>Reservas</span>
                      <span>{product.inventory ?? "Por confirmar"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                      <span>Ticket estimado</span>
                      <span>{formatCurrency(product.price, product.currency)}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 text-sm">
                    <Link
                      href={`/producto/${product.slug}`}
                      className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-white/40 hover:text-white"
                    >
                      Ver ficha
                    </Link>
                    <a
                      href={`https://wa.me/18492617328?text=${encodeURIComponent(
                        `Hola, quiero reservar el drop ${product.title}. ¿Me puedes apoyar?`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:opacity-90"
                    >
                      Reservar por WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
