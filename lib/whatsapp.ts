import type { Locale } from "@/lib/locale";
import { formatCurrency } from "@/lib/pricing";

export type CartLine = {
  title: string;
  qty: number;
  price: number;
  currency?: string;
  slug?: string;
};

type WhatsAppOptions = {
  siteUrl?: string;
  introMessage?: string;
  locale?: Locale;
};

export function buildWhatsAppUrl(numberIntl: string, lines: CartLine[], options?: WhatsAppOptions) {
  if (!lines.length) {
    return `https://wa.me/${numberIntl}`;
  }

  const locale = options?.locale ?? "es";
  const fallbackCurrency = lines.find((line) => line.currency)?.currency ?? "DOP";
  const intro = options?.introMessage ?? (locale === "en" ? "Hi, I want to buy:" : "Hola, quiero comprar:");

  const formattedLines = lines
    .map((line) => {
      const currency = line.currency ?? fallbackCurrency;
      const subtotal = formatCurrency(line.price * line.qty, currency, locale);
      return `- ${line.qty}x ${line.title} - ${subtotal}`;
    })
    .join("\n");

  const totalAmount = lines.reduce((acc, line) => acc + line.qty * line.price, 0);
  const total = formatCurrency(totalAmount, fallbackCurrency, locale);
  const totalLabel = locale === "en" ? "Estimated total" : "Total estimado";
  const siteLabel = locale === "en" ? "Website" : "Sitio";
  const site = options?.siteUrl ?? "https://foxsportscards1of1.com";
  const body = `${intro}\n${formattedLines}\n${totalLabel}: ${total}\n${siteLabel}: ${site}`;

  return `https://wa.me/${numberIntl}?text=${encodeURIComponent(body)}`;
}

