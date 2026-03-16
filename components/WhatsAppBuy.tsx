"use client";

import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Locale } from "@/lib/locale";
import type { Product } from "@/types/product";

const WHATSAPP_NUMBER = "18492617328";

type WhatsAppMode = "buy" | "reserve";

const DEFAULT_MESSAGES: Record<Locale, Record<WhatsAppMode, string>> = {
  es: {
    buy: "Hola, me interesa esta pieza:",
    reserve: "Hola, quiero reservar esta pieza antes del lanzamiento:",
  },
  en: {
    buy: "Hi, I am interested in this item:",
    reserve: "Hi, I want to reserve this item before release:",
  },
};

type WhatsAppBuyProps = {
  product: Product;
  mode?: WhatsAppMode;
  locale?: Locale;
};

export default function WhatsAppBuy({ product, mode = "buy", locale = "es" }: WhatsAppBuyProps) {
  const introMessage = product.whatsappMessage ?? DEFAULT_MESSAGES[locale][mode];
  const href = buildWhatsAppUrl(
    WHATSAPP_NUMBER,
    [
      {
        title: product.title,
        qty: 1,
        price: product.price,
        currency: product.currency,
        slug: product.slug,
      },
    ],
    { introMessage, locale },
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="focus-ring inline-flex items-center justify-center rounded-full border border-green/30 bg-white px-5 py-3 text-sm font-semibold text-green shadow-soft hover:border-green/50"
    >
      {mode === "reserve"
        ? locale === "en"
          ? "Reserve on WhatsApp"
          : "Reservar por WhatsApp"
        : locale === "en"
          ? "Buy on WhatsApp"
          : "Comprar por WhatsApp"}
    </a>
  );
}

