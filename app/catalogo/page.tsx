import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/pricing";
import { getAllProducts } from "@/lib/products";

export const revalidate = 60;

export const metadata = {
  title: "Catálogo | foxsportscards",
};

export default async function Page() {
  const products = await getAllProducts();
  const sorted = [...products].sort((a, b) => {
    const priority = (status?: string) => {
      switch (status) {
        case "available":
          return 0;
        case "reserved":
          return 1;
        case "upcoming":
          return 2;
        case "sold":
          return 3;
        default:
          return 2;
      }
    };
    return priority(a.status) - priority(b.status);
  });

  return (
    <div className="container py-16">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <span className="eyebrow">Catálogo curado</span>
          <h1 className="text-4xl font-heading font-semibold text-white">Encuentra tu próxima pieza estrella</h1>
          <p className="max-w-2xl text-sm text-muted">
            Singles premium, cajas selladas y memorabilia certificada. Ordenamos primero las piezas disponibles y destacadas para
            que hagas movimientos rápidos.
          </p>
        </div>
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-white/40 hover:text-white"
        >
          Gestionar contenido en el Studio →
        </Link>
      </div>

      <div className="mb-12 flex flex-wrap gap-3">
        {["NBA", "MLB", "TCG", "Memorabilia", "Breaks", "Reservados"].map((label) => (
          <span
            key={label}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted transition hover:border-white/30 hover:text-white"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((product) => {
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
                    {status === "sold" ? "Vendido" : status === "reserved" ? "Reservado" : "Próximo"}
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
    </div>
  );
}
