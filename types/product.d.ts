import type { PortableTextBlock } from "sanity";

export type ProductImage = {
  url: string;
  alt?: string | null;
  label?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  images: ProductImage[];
  shortDescription?: string | null;
  description?: PortableTextBlock[] | null;
  highlights?: string[];
  status?: "available" | "reserved" | "sold" | "upcoming";
  sport?: string | null;
  productType?: string | null;
  rarity?: string | null;
  year?: number | null;
  certification?: string | null;
  inventory?: number | null;
  tags?: string[];
  whatsappMessage?: string | null;
  heroVideoUrl?: string | null;
  category?: string | null;
  releaseDate?: string | null;
};
