import { createClient, type ClientConfig } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

type SanityImageSource = Image | { _ref?: string } | { asset?: { _ref?: string; _id?: string; url?: string }; url?: string } | string;

const envProjectId =
  process.env.SANITY_PROJECT_ID ??
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??
  process.env.SANITY_STUDIO_PROJECT_ID ??
  "";

const envDataset =
  process.env.SANITY_DATASET ??
  process.env.NEXT_PUBLIC_SANITY_DATASET ??
  process.env.SANITY_STUDIO_DATASET ??
  "";

export const isSanityConfigured = Boolean(envProjectId && envDataset);

type SanityClient = ReturnType<typeof createClient>;

function buildClientConfig(): ClientConfig {
  return {
    projectId: envProjectId,
    dataset: envDataset,
    apiVersion: process.env.SANITY_API_VERSION || "2024-10-01",
    useCdn: process.env.NODE_ENV === "production",
    perspective: "published",
    token: process.env.SANITY_READ_TOKEN,
  };
}

export const sanityClient: SanityClient | null = isSanityConfigured ? createClient(buildClientConfig()) : null;

let warnedAboutMissingConfig = false;

function warnAboutMissingConfig() {
  if (!warnedAboutMissingConfig && !isSanityConfigured) {
    console.warn(
      "[sanity] SANITY_PROJECT_ID or SANITY_DATASET is missing. Falling back to local data during the build.",
    );
    warnedAboutMissingConfig = true;
  }
}

export function getSanityClient(): SanityClient {
  if (!sanityClient) {
    throw new Error(
      "[sanity] Missing configuration. Provide SANITY_PROJECT_ID and SANITY_DATASET to enable Sanity data access.",
    );
  }
  return sanityClient;
}

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

export function urlForImage(source: SanityImageSource, width?: number, height?: number) {
  if (!source) {
    return null;
  }

  if (!builder) {
    warnAboutMissingConfig();
    if (typeof source === "string") {
      return source;
    }
    if (typeof source === "object") {
      const candidate = source as { url?: string; asset?: { url?: string } };
      if (candidate.url) {
        return candidate.url;
      }
      if (candidate.asset?.url) {
        return candidate.asset.url;
      }
    }
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
