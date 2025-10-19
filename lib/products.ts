import groq from "groq";
import type { PortableTextBlock } from "sanity";
import { sanityClient, urlForImage } from "@/lib/sanity.client";
import type { Product, ProductImage } from "@/types/product";

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
  gallery?: Array<{
    _key?: string;
    alt?: string;
    displayName?: string;
    url?: string;
    asset?: { _ref?: string; _id?: string };
  }>;
};

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
  featured,
  "heroVideoUrl": heroVideo.asset->url,
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

const PRODUCT_BY_SLUG_QUERY = groq`*[_type == "product" && slug.current == $slug][0] {
  ${PRODUCT_FIELDS}
}`;

function mapGallery(images: SanityProductDocument["gallery"], fallbackTitle: string): ProductImage[] {
  if (!images?.length) return [];
  return images
    .map((image) => {
      const url = urlForImage(image?.asset ?? image ?? image?.url ?? "") ?? image?.url ?? null;
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
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const docs = await sanityClient.fetch<SanityProductDocument[]>(ALL_PRODUCTS_QUERY);
  return docs.map(mapSanityProduct);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const doc = await sanityClient.fetch<SanityProductDocument>(PRODUCT_BY_SLUG_QUERY, { slug });
  if (!doc?._id) {
    throw new Error("Producto no encontrado");
  }
  return mapSanityProduct(doc);
}
