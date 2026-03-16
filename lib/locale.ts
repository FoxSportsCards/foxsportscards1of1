export const LOCALE_COOKIE_NAME = "site_locale";

export type Locale = "es" | "en";

export function normalizeLocale(value: string | null | undefined): Locale {
  if (!value) return "es";
  const normalized = value.toLowerCase().trim();
  return normalized === "en" ? "en" : "es";
}

export function formatLocaleTag(locale: Locale): string {
  return locale === "en" ? "en-US" : "es-DO";
}

