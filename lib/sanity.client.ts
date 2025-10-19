import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

type SanityImageSource = Image | { _ref: string } | { asset?: { _ref?: string; _id?: string } } | string;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[sanity] Missing environment variable: ${name}`);
  }
  return value;
}

export const sanityClient = createClient({
  projectId: requiredEnv("SANITY_PROJECT_ID"),
  dataset: requiredEnv("SANITY_DATASET"),
  apiVersion: process.env.SANITY_API_VERSION || "2024-10-01",
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published",
  token: process.env.SANITY_READ_TOKEN,
});

const builder = imageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource, width?: number, height?: number) {
  if (!source) {
    return null;
  }
  try {
    const imageBuilder = builder.image(source).auto("format").fit("max");
    if (width) {
      imageBuilder.width(width);
    }
    if (height) {
      imageBuilder.height(height);
    }
    return imageBuilder.url();
  } catch {
    return null;
  }
}
