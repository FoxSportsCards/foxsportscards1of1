import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { getServerLocale } from "@/lib/getServerLocale";
import { getProductPrices } from "@/lib/pricing";
import { getProductCategoryLabel } from "@/lib/productLabels";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import ProductActionButtons from "@/components/ProductActionButtons";
import ProductBackButton from "@/components/ProductBackButton";
import ProductGallery from "@/components/ProductGallery";
import ProductStatusBadge from "@/components/ProductStatusBadge";
import ProductCard from "@/components/ProductCard";
import type { Locale } from "@/lib/locale";
import type { Product, ProductImage } from "@/types/product";

export const runtime = "edge";
export const revalidate = 180;

function ensureImages(product: Product): ProductImage[] {
  if (product.images.length > 0) return product.images;
  return [{ url: "/hero.jpg", alt: product.title, label: "placeholder" }];
}

function getServiceNotes(locale: Locale) {
  if (locale === "en") {
    return [
      "Verified authenticity backed by the seller.",
      "Direct checkout by cart or WhatsApp.",
      "Insured shipping with follow-up until delivery.",
    ];
  }
  return [
    "Autenticidad verificada con respaldo del vendedor.",
    "Compra directa por carrito o WhatsApp.",
    "Envíos asegurados y seguimiento hasta la entrega.",
  ];
}

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const locale = getServerLocale();
  const isEn = locale === "en";
  let product: Product | null = null;
  let allProducts: Product[] = [];

  try {
    const [productResult, allProductsResult] = await Promise.all([
      getProductBySlug(params.slug),
      getAllProducts(),
    ]);
    product = productResult;
    allProducts = allProductsResult;
  } catch (error) {
    console.error(`[producto] error loading ${params.slug}`, error);
    notFound();
  }

  if (!product) notFound();

  const productImages = ensureImages(product);
  const prices = getProductPrices(product, locale);
  const serviceNotes = getServiceNotes(locale);
  const categoryLabel = getProductCategoryLabel(product, locale);
  const recommendations = allProducts
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => {
      const relationA =
        (a.sport && a.sport === product!.sport ? 1 : 0) + (a.productType === product!.productType ? 1 : 0);
      const relationB =
        (b.sport && b.sport === product!.sport ? 1 : 0) + (b.productType === product!.productType ? 1 : 0);
      return relationB - relationA;
    })
    .slice(0, 4);

  return (
    <section className="container py-12 sm:py-16">
      <div className="mb-5">
        <ProductBackButton fallbackHref="/catalogo" locale={locale} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <ProductGallery
          title={product.title}
          images={productImages}
          status={product.status ?? "available"}
          locale={locale}
        />

        <aside className="space-y-6">
          <div className="glass-card space-y-5 p-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-line bg-surface-elevated px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                {categoryLabel}
              </span>
              {product.year ? (
                <span className="rounded-full border border-line bg-surface-elevated px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {isEn ? `Edition ${product.year}` : `Edición ${product.year}`}
                </span>
              ) : null}
              {product.certification ? (
                <span className="rounded-full border border-green/30 bg-green/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-green">
                  {product.certification}
                </span>
              ) : null}
            </div>

            <div className="space-y-3">
              <ProductStatusBadge status={product.status} releaseDate={product.releaseDate} locale={locale} />
              <h1 className="text-3xl font-heading font-bold text-ink sm:text-4xl">{product.title}</h1>
              <div>
                <p className="text-2xl font-heading font-bold text-ink">{prices.primary}</p>
                {prices.secondary ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{prices.secondary}</p>
                ) : null}
              </div>
              <p className="text-sm text-muted">
                {product.shortDescription ??
                  (isEn
                    ? "Premium item curated for collectors looking for authenticity and fast checkout."
                    : "Pieza premium curada para compradores que buscan autenticidad y salida rápida.")}
              </p>
            </div>

            <ProductActionButtons product={product} locale={locale} />

            <dl className="grid gap-4 rounded-3xl border border-line bg-surface-elevated p-4 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {isEn ? "Inventory" : "Inventario"}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {typeof product.inventory === "number"
                    ? `${product.inventory} ${
                        product.inventory === 1
                          ? isEn
                            ? "item"
                            : "pieza"
                          : isEn
                            ? "items"
                            : "piezas"
                      }`
                    : isEn
                      ? "By request"
                      : "Bajo pedido"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {isEn ? "Response" : "Respuesta"}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">{isEn ? "Under 15 min" : "Menos de 15 min"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {isEn ? "Shipping" : "Envío"}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {isEn ? "24-48h in DR" : "24-48h en RD"}
                </dd>
              </div>
            </dl>

            <ul className="space-y-2">
              {serviceNotes.map((note, index) => (
                <li key={note} className="flex items-start gap-2">
                  <span
                    className={
                      index % 3 === 0
                        ? "status-dot-blue mt-1"
                        : index % 3 === 1
                          ? "status-dot-green mt-1"
                          : "status-dot-red mt-1"
                    }
                  />
                  <span className="text-sm text-muted">{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {product.highlights && product.highlights.length > 0 ? (
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                {isEn ? "Highlights" : "Puntos clave"}
              </h2>
              <ul className="mt-3 space-y-2">
                {product.highlights.map((highlight, index) => (
                  <li key={`${highlight}-${index}`} className="text-sm text-muted">
                    - {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.tags && product.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </aside>
      </div>

      {product.description ? (
        <article className="glass-card mt-10 p-6">
          <h2 className="text-lg font-heading font-bold text-ink">{isEn ? "Description" : "Descripción"}</h2>
          <div className="mt-3 space-y-3 text-sm text-muted">
            <PortableText value={product.description} />
          </div>
        </article>
      ) : null}

      {recommendations.length > 0 ? (
        <section className="mt-14">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">{isEn ? "Related items" : "Relacionados"}</span>
              <h2 className="mt-2 text-3xl font-heading font-bold text-ink">
                {isEn ? "More pieces for your collection" : "Más piezas para tu colección"}
              </h2>
            </div>
            <Link href="/catalogo" className="btn-ghost">
              {isEn ? "Back to catalog" : "Volver al catálogo"}
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {recommendations.map((item, index) => (
              <ProductCard key={item.slug} product={item} locale={locale} priority={index === 0} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
