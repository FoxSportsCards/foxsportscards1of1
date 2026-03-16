import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { getProductPrices } from "@/lib/pricing";
import type { Locale } from "@/lib/locale";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  locale?: Locale;
  priority?: boolean;
  className?: string;
};

const STATUS_TEXT: Record<NonNullable<Product["status"]>, Record<Locale, string>> = {
  available: { es: "Disponible", en: "Available" },
  reserved: { es: "Reservado", en: "Reserved" },
  sold: { es: "Vendido", en: "Sold" },
  upcoming: { es: "Proximo", en: "Upcoming" },
};

const STATUS_STYLE: Record<NonNullable<Product["status"]>, string> = {
  available: "bg-green/15 text-green border-green/30",
  reserved: "bg-blue/15 text-blue border-blue/30",
  sold: "bg-red/15 text-red border-red/30",
  upcoming: "bg-blue/15 text-blue border-blue/30",
};

export default function ProductCard({ product, locale = "es", priority = false, className }: ProductCardProps) {
  const cover = product.images[0]?.url ?? "/hero.jpg";
  const alt = product.images[0]?.alt ?? product.title;
  const status = (product.status ?? "available") as NonNullable<Product["status"]>;
  const prices = getProductPrices(product, locale);
  const fallbackType = locale === "en" ? "Collectible" : "Coleccionable";

  return (
    <Link
      href={`/producto/${product.slug}`}
      className={clsx(
        "group block overflow-hidden rounded-3xl border border-line bg-white shadow-soft",
        "hover:-translate-y-1 hover:border-blue/35",
        className,
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-elevated">
        <Image
          src={cover}
          alt={alt}
          fill
          sizes="(min-width: 1400px) 17vw, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          priority={priority}
        />
        <span
          className={clsx(
            "absolute left-3 top-3 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
            STATUS_STYLE[status],
          )}
        >
          {STATUS_TEXT[status][locale]}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          <span className="truncate">{product.sport ?? product.productType ?? fallbackType}</span>
          {product.year ? <span>{product.year}</span> : null}
        </div>
        <h3 className="line-clamp-2 min-h-[2.8rem] text-base font-semibold text-ink">{product.title}</h3>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-lg font-heading font-bold text-ink">{prices.primary}</p>
            {prices.secondary ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{prices.secondary}</p>
            ) : null}
          </div>
          {product.rarity ? (
            <span className="rounded-full border border-line bg-surface-elevated px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-strong">
              {product.rarity}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

