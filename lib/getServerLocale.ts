import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, normalizeLocale, type Locale } from "@/lib/locale";

export function getServerLocale(): Locale {
  const cookieStore = cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return normalizeLocale(rawLocale);
}

