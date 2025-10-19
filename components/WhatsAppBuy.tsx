"use client";

import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Product } from "@/types/product";

const WHATSAPP_NUMBER = "18290000000"; // Reemplazar por el número real sin '+'

export default function WhatsAppBuy({ product }: { product: Product }) {
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
      introMessage: product.whatsappMessage ?? "Hola, me interesa la siguiente pieza:",
    },
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
    >
      Comprar por WhatsApp
    </a>
  );
}
