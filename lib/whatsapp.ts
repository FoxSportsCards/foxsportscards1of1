import type { Locale } from "@/lib/locale";
import { formatCurrency } from "@/lib/pricing";
import { getPaymentLines } from "@/lib/payment";
import type { CustomerSummary } from "@/types/account";

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
  customer?: CustomerSummary | null;
  includePaymentDetails?: boolean;
  orderNumber?: string | null;
};

function formatCustomerLines(customer: CustomerSummary, locale: Locale) {
  const title = locale === "en" ? "Saved delivery info:" : "Datos guardados para entrega:";
  const lines = [title];

  if (customer.fullName) lines.push(`${locale === "en" ? "Name" : "Nombre"}: ${customer.fullName}`);
  if (customer.phone) lines.push(`${locale === "en" ? "Phone" : "Celular"}: ${customer.phone}`);
  if (customer.whatsapp) lines.push(`WhatsApp: ${customer.whatsapp}`);
  if (customer.email) lines.push(`Email: ${customer.email}`);
  if (customer.address) lines.push(`${locale === "en" ? "Address" : "Dirección"}: ${customer.address}`);
  if (customer.deliveryNotes) {
    lines.push(`${locale === "en" ? "Delivery notes" : "Notas de entrega"}: ${customer.deliveryNotes}`);
  }

  return lines.join("\n");
}

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
  const sections = [
    intro,
    formattedLines,
    `${totalLabel}: ${total}`,
    options?.orderNumber ? `${locale === "en" ? "Web order" : "Orden web"}: ${options.orderNumber}` : null,
    options?.customer ? formatCustomerLines(options.customer, locale) : null,
    options?.includePaymentDetails ? getPaymentLines(locale).join("\n") : null,
    `${siteLabel}: ${site}`,
  ].filter(Boolean);
  const body = sections.join("\n\n");

  return `https://wa.me/${numberIntl}?text=${encodeURIComponent(body)}`;
}
