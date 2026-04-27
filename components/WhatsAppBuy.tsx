"use client";

import { useState } from "react";
import Link from "next/link";
import { useCheckoutGuard } from "@/hooks/useCheckoutGuard";
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
  quantity?: number;
};

export default function WhatsAppBuy({ product, mode = "buy", locale = "es", quantity = 1 }: WhatsAppBuyProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkoutGuard = useCheckoutGuard();
  const introMessage = product.whatsappMessage ?? DEFAULT_MESSAGES[locale][mode];
  const line = {
    title: product.title,
    qty: Math.max(1, quantity),
    price: product.price,
    currency: product.currency,
    slug: product.slug,
  };

  const handleBuy = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    const checkoutWindow = window.open("about:blank", "_blank");
    let finalUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, [line], {
      introMessage,
      includePaymentDetails: true,
      locale,
    });

    try {
      const { createCustomerOrder, profileToCustomerSummary } = await import("@/lib/customerOrders");
      const result = await createCustomerOrder([line], introMessage);

      if (result.status !== "created") {
        const message =
          "errorMessage" in result && result.errorMessage
            ? result.errorMessage
            : locale === "en"
              ? "We could not create the order. Please try again."
              : "No pudimos crear el pedido. Inténtalo de nuevo.";
        setError(message);
        checkoutWindow?.close();
        return;
      }

      finalUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, [line], {
        introMessage,
        locale,
        customer: profileToCustomerSummary(result.profile),
        includePaymentDetails: true,
        orderNumber: result.orderNumber,
      });
    } catch (buyError) {
      console.error("[product] purchase handoff failed", buyError);
      setError(locale === "en" ? "We could not prepare the order." : "No pudimos preparar el pedido.");
      checkoutWindow?.close();
      return;
    } finally {
      setLoading(false);
    }

    if (checkoutWindow) {
      checkoutWindow.opener = null;
      checkoutWindow.location.href = finalUrl;
    } else {
      window.location.href = finalUrl;
    }
  };

  const label =
    mode === "reserve"
      ? locale === "en"
        ? "Reserve"
        : "Reservar"
      : locale === "en"
        ? "Buy"
        : "Comprar";
  const loadingLabel = locale === "en" ? "Preparing..." : "Preparando...";
  const btnClass =
    "focus-ring inline-flex items-center justify-center rounded-full border border-green/30 bg-white px-5 py-3 text-sm font-semibold text-green shadow-soft hover:border-green/50";

  return (
    <div className="space-y-2">
      {checkoutGuard === "no-session" ? (
        <Link href="/login" className={btnClass}>
          {locale === "en" ? "Sign in to buy" : "Inicia sesión para comprar"}
        </Link>
      ) : checkoutGuard === "no-profile" ? (
        <Link href="/cuenta" className={btnClass}>
          {locale === "en" ? "Complete your profile" : "Completa tu perfil"}
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleBuy}
          disabled={loading || checkoutGuard === "loading"}
          className={`${btnClass} disabled:cursor-wait disabled:opacity-70`}
        >
          {loading ? loadingLabel : label}
        </button>
      )}
      {error ? (
        <p className="max-w-xs rounded-2xl border border-red/20 bg-red/10 px-3 py-2 text-xs font-semibold text-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
