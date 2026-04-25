import groq from "groq";
import { cache } from "react";
import type { PortableTextBlock } from "sanity";
import { FALLBACK_PRODUCTS } from "@/data/fallback-products";
import { applyInventory } from "@/lib/inventory";
import { getSanityClient, isSanityConfigured, urlForImage } from "@/lib/sanity.client";
import type { Product, ProductImage } from "@/types/product";

type GalleryImage = {
  _key?: string;
  alt?: string;
  displayName?: string;
  url?: string;
  asset?: { _ref?: string; _id?: string };
};

type SanityProductDocument = {
  _id: string;
  id?: string;
  slug?: string;
  title: string;
  shortDescription?: string;
  description?: PortableTextBlock[];
  highlights?: string[];
  price?: number;
  currency?: string;
  status?: Product["status"];
  sport?: string;
  productType?: string;
  rarity?: string;
  year?: number;
  certification?: string;
  inventory?: number;
  tags?: string[];
  whatsappMessage?: string;
  heroVideoUrl?: string;
  featured?: boolean;
  gallery?: GalleryImage[];
  releaseDate?: string;
  alternatePricing?: {
    enabled?: boolean;
    currency?: string;
    amount?: number;
  };
};

function hasImageSource(image: unknown): image is GalleryImage {
  if (!image || typeof image !== "object") return false;
  const candidate = image as GalleryImage;
  return Boolean(candidate.asset) || typeof candidate.url === "string";
}

const PRODUCT_FIELDS = groq`
  _id,
  "id": coalesce(id, _id),
  title,
  "slug": slug.current,
  shortDescription,
  description,
  highlights,
  price,
  currency,
  status,
  sport,
  productType,
  rarity,
  year,
  certification,
  inventory,
  tags,
  whatsappMessage,
  releaseDate,
  featured,
  "heroVideoUrl": heroVideo.asset->url,
  "alternatePricing": alternatePricing {
    enabled,
    currency,
    amount
  },
  gallery[]{
    _key,
    alt,
    displayName,
    "url": asset->url,
    asset
  }
`;

const ALL_PRODUCTS_QUERY = groq`*[_type == "product" && defined(slug.current)] | order(coalesce(featured, false) desc, _createdAt desc) {
  ${PRODUCT_FIELDS}
}`;

const CATALOG_PRODUCTS_QUERY = groq`*[_type == "product" && defined(slug.current)] | order(coalesce(featured, false) desc, _createdAt desc)[$start...$end] {
  ${PRODUCT_FIELDS}
}`;

const PRODUCT_COUNT_QUERY = groq`count(*[_type == "product" && defined(slug.current)])`;

const PRODUCT_BY_SLUG_QUERY = groq`*[_type == "product" && slug.current == $slug][0] {
  ${PRODUCT_FIELDS}
}`;

let warnedAboutFallback = false;
function warnAboutFallbackUsage() {
  if (!warnedAboutFallback) {
    console.warn("[sanity] Using local fallback product data because Sanity credentials are missing.");
    warnedAboutFallback = true;
  }
}

function mapGallery(images: SanityProductDocument["gallery"], fallbackTitle: string): ProductImage[] {
  const gallery = Array.isArray(images) ? images : [];
  if (!gallery.length) return [];
  return gallery
    .filter(hasImageSource)
    .map<ProductImage | null>((image) => {
      const assetUrl = image.asset ? urlForImage(image.asset) : null;
      const directUrl = typeof image.url === "string" && image.url.length > 0 ? image.url : null;
      const url = assetUrl ?? directUrl ?? null;
      if (!url) return null;
      return {
        url,
        alt: image?.alt ?? fallbackTitle,
        label: image?.displayName ?? null,
      };
    })
    .filter((img): img is ProductImage => img !== null);
}

function mapSanityProduct(doc: SanityProductDocument): Product {
  const images = mapGallery(doc.gallery, doc.title);
  const safeImages = images.length
    ? images
    : [
        {
          url: "/hero.jpg",
          alt: doc.title,
          label: "placeholder",
        },
      ];
  return {
    id: doc.id ?? doc._id,
    slug: doc.slug && doc.slug.length ? doc.slug : doc.id ?? doc._id,
    title: doc.title,
    price: doc.price ?? 0,
    currency: doc.currency ?? "DOP",
    images: safeImages,
    shortDescription: doc.shortDescription ?? null,
    description: doc.description ?? null,
    highlights: doc.highlights ?? [],
    status: doc.status ?? "available",
    sport: doc.sport ?? null,
    productType: doc.productType ?? null,
    rarity: doc.rarity ?? null,
    year: doc.year ?? null,
    certification: doc.certification ?? null,
    inventory: doc.inventory ?? null,
    tags: doc.tags ?? [],
    whatsappMessage: doc.whatsappMessage ?? null,
    heroVideoUrl: doc.heroVideoUrl ?? null,
    category: doc.productType ?? doc.sport ?? null,
    releaseDate: doc.releaseDate ?? null,
    featured: Boolean(doc.featured),
    alternatePricing:
      doc.alternatePricing?.enabled && doc.alternatePricing?.amount && doc.alternatePricing?.currency
        ? {
            enabled: true,
            currency: doc.alternatePricing.currency,
            amount: doc.alternatePricing.amount,
          }
        : null,
  };
}

function cloneProduct(product: Product): Product {
  return {
    ...product,
    images: product.images.map((image) => ({ ...image })),
    highlights: product.highlights ? [...product.highlights] : [],
    tags: product.tags ? [...product.tags] : [],
    alternatePricing: product.alternatePricing ? { ...product.alternatePricing } : null,
  };
}

function cloneFallbackProducts(): Product[] {
  return FALLBACK_PRODUCTS.map(cloneProduct);
}

async function fetchAllProductsUncached(): Promise<Product[]> {
  if (!isSanityConfigured) {
    warnAboutFallbackUsage();
    return applyInventory(cloneFallbackProducts());
  }
  const docs = await getSanityClient().fetch<SanityProductDocument[]>(ALL_PRODUCTS_QUERY);
  return applyInventory(docs.map(mapSanityProduct));
}

async function fetchProductBySlugUncached(slug: string): Promise<Product> {
  if (!isSanityConfigured) {
    warnAboutFallbackUsage();
    const fallback = FALLBACK_PRODUCTS.find((item) => item.slug === slug);
    if (!fallback) {
      throw new Error("Producto no encontrado");
    }
    const [product] = await applyInventory([cloneProduct(fallback)]);
    return product;
  }
  const doc = await getSanityClient().fetch<SanityProductDocument>(PRODUCT_BY_SLUG_QUERY, { slug });
  if (!doc?._id) {
    throw new Error("Producto no encontrado");
  }
  const [product] = await applyInventory([mapSanityProduct(doc)]);
  return product;
}

const getAllProductsCached = cache(fetchAllProductsUncached);

const getProductBySlugCached = cache(fetchProductBySlugUncached);

export async function getAllProducts(): Promise<Product[]> {
  return getAllProductsCached();
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return getProductBySlugCached(slug);
}

export async function getCatalogProducts(page: number, pageSize: number): Promise<{ products: Product[]; total: number }> {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.max(1, Math.min(48, Math.floor(pageSize)));
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  if (!isSanityConfigured) {
    warnAboutFallbackUsage();
    const fallback = cloneFallbackProducts();
    return {
      products: await applyInventory(fallback.slice(start, end)),
      total: fallback.length,
    };
  }

  const [docs, total] = await Promise.all([
    getSanityClient().fetch<SanityProductDocument[]>(CATALOG_PRODUCTS_QUERY, { start, end }),
    getSanityClient().fetch<number>(PRODUCT_COUNT_QUERY),
  ]);

  return {
    products: await applyInventory(docs.map(mapSanityProduct)),
    total,
  };
}
