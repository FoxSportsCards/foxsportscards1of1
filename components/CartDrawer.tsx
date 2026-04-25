"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import clsx from "clsx";
import { useCart } from "@/store/cart";
import { BANK_PAYMENT_DETAILS } from "@/lib/payment";
import { formatCurrency, getProductPrices } from "@/lib/pricing";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Locale } from "@/lib/locale";

const WHATSAPP_NUMBER = "18492617328";

type CartDrawerProps = {
  locale?: Locale;
};

export default function CartDrawer({ locale = "es" }: CartDrawerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const items = useCart((state) => state.items);
  const remove = useCart((state) => state.remove);
  const clear = useCart((state) => state.clear);

  const copy =
    locale === "en"
      ? {
          cart: "Cart",
          title: "Your cart",
          piece: "item",
          pieces: "items",
          close: "Close",
          empty: "Your cart is empty. Go to the catalog and add your favorite pieces.",
          alternate: "Alternate",
          remove: "Remove",
          total: "Total",
          alternateTotal: "Alternate total",
          confirm: "Confirm on WhatsApp",
          confirming: "Preparing order...",
          clear: "Clear cart",
          intro: "Hi, I want to confirm this order:",
          paymentTitle: "Bank transfer",
          paymentNote: "Use these details after we confirm stock and delivery.",
          beneficiary: "Beneficiary",
          account: "Account",
          savedInfoNote: "If you are logged in, your saved delivery profile is added to WhatsApp and order history.",
          historyError: "The order could not be saved to your history, but WhatsApp will still open.",
          checkoutError: "The order could not be created. Check stock or try again.",
        }
      : {
          cart: "Carrito",
          title: "Tu carrito",
          piece: "pieza",
          pieces: "piezas",
          close: "Cerrar",
          empty: "Aún no hay productos en el carrito. Ve al catálogo y agrega tus piezas favoritas.",
          alternate: "Alterno",
          remove: "Quitar",
          total: "Total",
          alternateTotal: "Total alterno",
          confirm: "Confirmar por WhatsApp",
          confirming: "Preparando pedido...",
          clear: "Vaciar carrito",
          intro: "Hola, quiero confirmar este pedido:",
          paymentTitle: "Transferencia bancaria",
          paymentNote: "Usa estos datos luego de que confirmemos stock y entrega.",
          beneficiary: "Beneficiario",
          account: "Cuenta",
          savedInfoNote:
            "Si iniciaste sesión, agregamos tus datos de entrega al WhatsApp y guardamos el pedido en tu historial.",
          historyError: "No se pudo guardar el pedido en tu historial, pero WhatsApp se abrirá igual.",
          checkoutError: "No se pudo crear el pedido. Revisa el stock o intenta de nuevo.",
        };

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const totalCurrency = items[0]?.product.currency ?? "DOP";
  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [items],
  );

  const alternateTotals = useMemo(() => {
    if (!items.length) return null;
    const valid = items.filter(
      (item) =>
        item.product.alternatePricing?.enabled &&
        item.product.alternatePricing.amount &&
        item.product.alternatePricing.currency,
    );
    if (valid.length !== items.length) return null;
    const currency = valid[0].product.alternatePricing!.currency!;
    if (!valid.every((item) => item.product.alternatePricing!.currency === currency)) return null;
    const total = valid.reduce(
      (sum, item) => sum + (item.product.alternatePricing!.amount ?? 0) * item.qty,
      0,
    );
    return { currency, total };
  }, [items]);

  const cartLines = useMemo(
    () =>
      items.map(({ product, qty }) => ({
        title: product.title,
        qty,
        price: product.price,
        currency: product.currency ?? "DOP",
        slug: product.slug,
      })),
    [items],
  );

  const whatsappLink = useMemo(() => {
    if (!cartLines.length) return "#";
    return buildWhatsAppUrl(WHATSAPP_NUMBER, cartLines, {
      introMessage: copy.intro,
      includePaymentDetails: true,
      locale,
    });
  }, [cartLines, copy.intro, locale]);

  const handleCheckout = async () => {
    if (!cartLines.length || checkoutLoading) return;
    setCheckoutLoading(true);
    setCheckoutError(null);

    const checkoutWindow = window.open("about:blank", "_blank");
    let finalUrl = whatsappLink;

    try {
      const { createCustomerOrder, profileToCustomerSummary } = await import("@/lib/customerOrders");
      const result = await createCustomerOrder(cartLines, copy.intro);
      const customer = profileToCustomerSummary(result.profile);

      if (result.status === "error") {
        const message = "errorMessage" in result && result.errorMessage ? result.errorMessage : copy.checkoutError;
        setCheckoutError(message);
        checkoutWindow?.close();
        return;
      }

      finalUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, cartLines, {
        introMessage: copy.intro,
        locale,
        customer,
        includePaymentDetails: true,
        orderNumber: result.orderNumber,
      });
    } catch (error) {
      console.error("[cart] checkout handoff failed", error);
      setCheckoutError(copy.historyError);
    } finally {
      setCheckoutLoading(false);
    }

    if (checkoutWindow) {
      checkoutWindow.opener = null;
      checkoutWindow.location.href = finalUrl;
    } else {
      window.location.href = finalUrl;
    }
    setOpen(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="focus-ring group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white px-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted shadow-soft hover:border-blue/30 hover:text-blue md:h-auto md:w-auto md:gap-2 md:px-4 md:py-2"
      >
        <CartIcon className="h-4 w-4" />
        <span className="hidden md:inline">{copy.cart}</span>
        {itemCount > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red px-1 text-[11px] font-semibold text-white shadow-glow-red">
            {itemCount}
          </span>
        ) : null}
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[60] grid place-items-center p-4">
              <div
                className="absolute inset-0 bg-[#081126]/60 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                aria-hidden
              />

              <aside
                role="dialog"
                aria-modal="true"
                className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-glass"
              >
                <header className="flex items-center justify-between border-b border-line px-5 py-4">
                  <div>
                    <h2 className="text-lg font-heading font-bold text-ink">{copy.title}</h2>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                      {itemCount} {itemCount === 1 ? copy.piece : copy.pieces}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="focus-ring rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted hover:border-blue/35 hover:text-blue"
                  >
                    {copy.close}
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                  {items.length === 0 ? (
                    <p className="rounded-2xl border border-line bg-surface-elevated px-6 py-8 text-center text-sm text-muted">
                      {copy.empty}
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {items.map(({ product, qty }) => {
                        const cover = product.images[0]?.url ?? "/hero.jpg";
                        const prices = getProductPrices(product, locale);
                        const hasAlt =
                          product.alternatePricing?.enabled &&
                          product.alternatePricing.amount &&
                          product.alternatePricing.currency;

                        return (
                          <li
                            key={product.slug}
                            className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-3"
                          >
                            <div className="relative h-16 w-14 overflow-hidden rounded-xl border border-line">
                              <Image
                                src={cover}
                                alt={product.images[0]?.alt ?? product.title}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-1 flex-col gap-1">
                              <p className="line-clamp-1 text-sm font-semibold text-ink">{product.title}</p>
                              <div className="flex items-center justify-between text-xs text-muted">
                                <span>
                                  {qty} x {prices.primary}
                                </span>
                                <span className="text-sm font-heading font-bold text-ink">
                                  {formatCurrency(product.price * qty, product.currency ?? "DOP", locale)}
                                </span>
                              </div>
                              {hasAlt ? (
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                                  {copy.alternate}:{" "}
                                  {formatCurrency(
                                    (product.alternatePricing?.amount ?? 0) * qty,
                                    product.alternatePricing?.currency ?? "USD",
                                    locale,
                                  )}
                                </p>
                              ) : null}
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => remove(product.slug)}
                                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red hover:opacity-80"
                                >
                                  {copy.remove}
                                </button>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <footer className="space-y-3 border-t border-line bg-surface px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">{copy.total}</span>
                    <span className="text-xl font-heading font-bold text-ink">
                      {formatCurrency(totalAmount, totalCurrency, locale)}
                    </span>
                  </div>

                  {alternateTotals ? (
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted">
                      <span>{copy.alternateTotal}</span>
                      <span>{formatCurrency(alternateTotals.total, alternateTotals.currency, locale)}</span>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-blue/15 bg-white px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue">
                          {copy.paymentTitle}
                        </p>
                        <p className="mt-1 text-xs text-muted">{copy.paymentNote}</p>
                      </div>
                      <div className="text-left text-xs font-semibold text-ink sm:text-right">
                        <p>{BANK_PAYMENT_DETAILS.bank}</p>
                        <p>
                          {copy.beneficiary}: {BANK_PAYMENT_DETAILS.beneficiary}
                        </p>
                        <p>
                          {copy.account}: {BANK_PAYMENT_DETAILS.accountNumber} | {BANK_PAYMENT_DETAILS.currency}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-muted">{copy.savedInfoNote}</p>
                  </div>

                  {checkoutError ? (
                    <p className="rounded-2xl border border-red/20 bg-red/10 px-4 py-2 text-xs font-semibold text-red">
                      {checkoutError}
                    </p>
                  ) : null}

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={!items.length || checkoutLoading}
                      className={clsx(
                        "inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em]",
                        items.length
                          ? "bg-blue text-white shadow-glow hover:brightness-95 disabled:cursor-wait disabled:opacity-75"
                          : "cursor-not-allowed bg-line text-muted",
                      )}
                    >
                      {checkoutLoading ? copy.confirming : copy.confirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clear();
                        setOpen(false);
                      }}
                      className="focus-ring rounded-full border border-line px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-muted hover:border-red/35 hover:text-red disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!items.length}
                    >
                      {copy.clear}
                    </button>
                  </div>
                </footer>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 3h2l2.4 11.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 6H6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="19" r="1.2" />
      <circle cx="17" cy="19" r="1.2" />
    </svg>
  );
}
