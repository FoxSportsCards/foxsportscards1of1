import type { Locale } from "@/lib/locale";
import type { Product } from "@/types/product";

const SPORT_LABELS: Record<string, Record<Locale, string>> = {
  nba: { es: "Baloncesto", en: "Basketball" },
  basketball: { es: "Baloncesto", en: "Basketball" },
  mlb: { es: "Béisbol", en: "Baseball" },
  baseball: { es: "Béisbol", en: "Baseball" },
  soccer: { es: "Fútbol", en: "Soccer" },
  futbol: { es: "Fútbol", en: "Soccer" },
  nfl: { es: "Fútbol americano", en: "Football" },
  pokemon: { es: "Pokémon", en: "Pokémon" },
  tcg: { es: "TCG", en: "TCG" },
  f1: { es: "F1", en: "F1" },
  other: { es: "Otros", en: "Other" },
};

const PRODUCT_TYPE_LABELS: Record<string, Record<Locale, string>> = {
  single: { es: "Carta individual", en: "Single card" },
  "sports-card": { es: "Carta deportiva", en: "Sports card" },
  "pokemon-card": { es: "Carta Pokémon", en: "Pokémon card" },
  sealed: { es: "Caja sellada", en: "Sealed box" },
  "signed-jersey": { es: "Jersey firmado", en: "Signed jersey" },
  "signed-ball": { es: "Pelota firmada", en: "Signed ball" },
  "signed-memorabilia": { es: "Artículo firmado", en: "Signed collectible" },
  memorabilia: { es: "Memorabilia", en: "Memorabilia" },
  break: { es: "Break", en: "Break" },
};

function humanize(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .replace(/\bNba\b/g, "NBA")
    .replace(/\bMlb\b/g, "MLB")
    .replace(/\bNfl\b/g, "NFL")
    .replace(/\bTcg\b/g, "TCG");
}

export function getSportLabel(value: string | null | undefined, locale: Locale = "es") {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return SPORT_LABELS[normalized]?.[locale] ?? humanize(value);
}

export function getProductTypeLabel(value: string | null | undefined, locale: Locale = "es") {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return PRODUCT_TYPE_LABELS[normalized]?.[locale] ?? humanize(value);
}

export function getProductCategoryLabel(product: Product, locale: Locale = "es") {
  return (
    getProductTypeLabel(product.productType, locale) ??
    getSportLabel(product.sport, locale) ??
    (locale === "en" ? "Collectible" : "Coleccionable")
  );
}
