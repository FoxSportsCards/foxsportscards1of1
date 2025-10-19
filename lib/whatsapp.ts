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
};

export function buildWhatsAppUrl(numberIntl: string, lines: CartLine[], options?: WhatsAppOptions) {
  if (!lines.length) {
    return `https://wa.me/${numberIntl}`;
  }

  const fallbackCurrency = lines.find((line) => line.currency)?.currency ?? "DOP";

  const intro = options?.introMessage ?? "Hola, quiero comprar:";
  const formattedLines = lines
    .map((line) => {
      const currency = line.currency ?? fallbackCurrency;
      return `• ${line.qty}x ${line.title} – ${formatCurrency(line.price * line.qty, currency)}`;
    })
    .join("\n");

  const totalAmount = lines.reduce((acc, line) => acc + line.qty * line.price, 0);
  const total = formatCurrency(totalAmount, fallbackCurrency);
  const site = options?.siteUrl ?? "https://foxsportscards.pages.dev";

  const body = `${intro}\n${formattedLines}\nTotal estimado: ${total}\nSitio: ${site}`;

  return `https://wa.me/${numberIntl}?text=${encodeURIComponent(body)}`;
}
