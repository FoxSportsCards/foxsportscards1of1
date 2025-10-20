import type { QueryParams } from "@sanity/client";
import { client } from "./client";

/**
 * Lightweight replacement for next-sanity's live helpers.
 * Provides a minimal fetch wrapper and a no-op live component so the studio can build without the dependency.
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
  options?: { stega?: boolean },
): Promise<T> {
  return client.fetch<T>(query, params, options);
}

export const SanityLive = () => null;
