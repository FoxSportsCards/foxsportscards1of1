import { createClient } from "@sanity/client";

const projectId =
  process.env.SANITY_PROJECT_ID ??
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??
  process.env.SANITY_STUDIO_PROJECT_ID;

const dataset =
  process.env.SANITY_DATASET ??
  process.env.NEXT_PUBLIC_SANITY_DATASET ??
  process.env.SANITY_STUDIO_DATASET;

const apiVersion = process.env.SANITY_API_VERSION ?? process.env.SANITY_STUDIO_API_VERSION ?? "2024-10-01";

export function isSanityWriteConfigured() {
  return Boolean(projectId && dataset && process.env.SANITY_WRITE_TOKEN);
}

function getSanityWriteClient() {
  if (!isSanityWriteConfigured()) return null;
  return createClient({
    projectId: projectId!,
    dataset: dataset!,
    apiVersion,
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  });
}

export async function syncSanityInventory(productSlug: string, quantity: number) {
  const client = getSanityWriteClient();
  if (!client) {
    return { ok: false as const, reason: "not-configured" as const };
  }

  const docId = await client.fetch<string | null>(
    `*[_type == "product" && slug.current == $slug][0]._id`,
    { slug: productSlug },
  );

  if (!docId) {
    return { ok: false as const, reason: "not-found" as const };
  }

  await client.patch(docId).set({ inventory: quantity }).commit();
  return { ok: true as const };
}
