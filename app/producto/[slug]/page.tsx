import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { formatCurrency } from "@/lib/pricing";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import AddToCart from "@/components/AddToCart";
import WhatsAppBuy from "@/components/WhatsAppBuy";
import ProductGallery from "@/components/ProductGallery";
import type { Product, ProductImage } from "@/types/product";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.map((product) => ({ slug: product.slug }));
  } catch (error) {
    console.error("[producto] Failed to preload product slugs", error);
    return [];
  }
}

function ensureImages(product: Product): ProductImage[] {
  if (product.images.length > 0) {
    return product.images;
  }
  return [
    {
      url: "/hero.jpg",
      alt: product.title,
      label: "placeholder",
    },
  ];
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let product: Product | null = null;
  let allProducts: Product[] = [];

  try {
    const [productResult, allProductsResult] = await Promise.all([
      getProductBySlug(params.slug),
      getAllProducts(),
    ]);
    product = productResult;
    allProducts = Array.isArray(allProductsResult) ? allProductsResult : [];
  } catch (error) {
    console.error(`[producto] Failed to load product ${params.slug}`, error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  const productImages = ensureImages(product);

  const relatedPool = allProducts.filter((item) => item.slug !== product!.slug);
  const prioritized = relatedPool.filter(
    (item) => item.sport === product!.sport || item.productType === product!.productType,
  );
  const deduped = [...prioritized, ...relatedPool].filter(
    (item, index, array) => array.findIndex((entry) => entry.slug === item.slug) === index,
  );
  const recommendations = deduped.slice(0, 3);

  const statusLabel =
    product.status === "sold"
      ? "No disponible"
      : product.status === "reserved"
        ? "Reservado"
        : product.status === "upcoming"
          ? "Próximo lanzamiento"
          : "Disponible";

  return (
    <div className="container py-16">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.9fr]">
        <ProductGallery title={product.title} images={productImages} status={product.status ?? "available"} />

        <div className="space-y-8">
          <div className="space-y-5 rounded-4xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur lg:sticky lg:top-28">
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-muted">
              <span>{product.sport ?? product.productType ?? "Coleccionable"}</span>
              {product.year && <span>Edición {product.year}</span>}
              {product.certification && <span>Grading {product.certification}</span>}
              {product.rarity && <span>{product.rarity}</span>}
            </div>

            <div className="space-y-3">
              <span className="inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/70">
                {statusLabel}
              </span>
              <h1 className="text-3xl font-heading font-semibold text-white lg:text-[34px]">{product.title}</h1>
              <p className="text-2xl font-heading text-accent">{formatCurrency(product.price, product.currency)}</p>
              {product.shortDescription && <p className="text-sm text-muted">{product.shortDescription}</p>}
            </div>

            <div className="flex flex-wrap gap-3">
              <AddToCart product={product} />
              <WhatsAppBuy product={product} />
            </div>

            <div className="grid gap-4 rounded-3xl border border-white/5 bg-background/70 p-5 text-xs uppercase tracking-[0.3em] text-muted">
              <div className="flex items-center justify-between">
                <span>Inventario</span>
                <span>
                  {typeof product.inventory === "number"
                    ? `${product.inventory} ${product.inventory === 1 ? "pieza" : "piezas"}`
                    : "Bajo pedido"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Concierge</span>
                <span>Respuesta &lt; 15 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Envío</span>
                <span>Seguro 24-48h RD</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted">
              <p>• Autenticidad verificada con documentación disponible.</p>
              <p>• Asesoría personalizada para inversionistas y coleccionistas.</p>
              <p>• Envíos asegurados en República Dominicana y coordinación internacional.</p>
            </div>
          </div>

          {product.highlights && product.highlights.length > 0 && (
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
              <h2 className="text-sm uppercase tracking-[0.3em] text-muted">Por qué destaca</h2>
              <ul className="space-y-2 text-sm text-muted">
                {product.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-accent" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.description && (
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-muted shadow-soft">
              <h2 className="text-sm uppercase tracking-[0.3em] text-muted">Descripción detallada</h2>
              <PortableText value={product.description} />
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="mt-20 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">También te puede interesar</span>
              <h2 className="mt-3 text-2xl font-heading font-semibold text-white">Más piezas seleccionadas para ti</h2>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-white/40 hover:text-white"
            >
              Ver catálogo →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item) => (
              <Link
                key={item.slug}
                href={`/producto/${item.slug}`}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-soft transition hover:-translate-y-1 hover:border-white/25 hover:shadow-glow"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={item.images[0]?.url ?? "/hero.jpg"}
                    alt={item.images[0]?.alt ?? item.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 35vw, 80vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                    <span>{item.sport ?? item.productType ?? "Coleccionable"}</span>
                    {item.year && <span>{item.year}</span>}
                  </div>
                  <h3 className="line-clamp-2 text-sm font-medium text-white/90">{item.title}</h3>
                  <div className="flex items-center justify-between text-sm font-semibold text-accent">
                    <span>{formatCurrency(item.price, item.currency)}</span>
                    {item.rarity && <span className="text-xs text-muted">{item.rarity}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
