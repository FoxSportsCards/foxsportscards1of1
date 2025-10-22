"use client";

import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Product } from "@/types/product";

const WHATSAPP_NUMBER = "18492617328"; // Número de WhatsApp en formato internacional sin '+'

type WhatsAppMode = "buy" | "reserve";

const DEFAULT_MESSAGES: Record<WhatsAppMode, string> = {
  buy: "Hola, me interesa la siguiente pieza:",
  reserve: "Hola, quiero reservar esta pieza antes del lanzamiento:",
};

type WhatsAppBuyProps = {
  product: Product;
  mode?: WhatsAppMode;
};

export default function WhatsAppBuy({ product, mode = "buy" }: WhatsAppBuyProps) {
  const introMessage = product.whatsappMessage ?? DEFAULT_MESSAGES[mode];
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
    {
      introMessage,
    },
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
    >
      {mode === "reserve" ? "Reservar por WhatsApp" : "Comprar por WhatsApp"}
    </a>
  );
}
