"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import clsx from "clsx";
import { useCart } from "@/store/cart";
import { formatCurrency, getProductPrices } from "@/lib/pricing";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const WHATSAPP_NUMBER = "18492617328";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCart((state) => state.items);
  const remove = useCart((state) => state.remove);
  const clear = useCart((state) => state.clear);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const totalCurrency = items[0]?.product.currency ?? "DOP";
  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [items],
  );
  const alternateTotals = useMemo(() => {
    if (!items.length) return null;
    const entries = items.filter(
      (item) =>
        item.product.alternatePricing?.enabled &&
        item.product.alternatePricing.amount &&
        item.product.alternatePricing.currency,
    );
    if (!entries.length) return null;
    if (entries.length !== items.length) return null;
    const currency = entries[0].product.alternatePricing!.currency!;
    const sameCurrency = entries.every(
      (item) => item.product.alternatePricing!.currency === currency,
    );
    if (!sameCurrency) return null;
    const total = entries.reduce(
      (sum, item) => sum + (item.product.alternatePricing!.amount ?? 0) * item.qty,
      0,
    );
    return { currency, total };
  }, [items]);

  const whatsappLink = useMemo(() => {
    if (!items.length) return "#";
    const lines = items.map(({ product, qty }) => ({
      title: product.title,
      qty,
      price: product.price,
      currency: product.currency ?? "DOP",
      slug: product.slug,
    }));
    return buildWhatsAppUrl(WHATSAPP_NUMBER, lines, {
      introMessage: "Hola, quiero confirmar este pedido:",
    });
  }, [items]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="group relative inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-muted shadow-soft transition hover:border-white/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <CartIcon className="h-4 w-4 text-muted transition group-hover:text-white" />
        <span>Carrito</span>
        {itemCount > 0 && (
          <>
            <span className="sr-only">{itemCount} {itemCount === 1 ? "artículo en el carrito" : "artículos en el carrito"}</span>
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-black shadow-glow"
            >
              {itemCount}
            </span>
          </>
        )}
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[60] grid place-items-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity md:bg-black/80"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/10 bg-background text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl max-h-[calc(100vh-2.5rem)] sm:max-w-xl md:max-h-[82vh] md:max-w-5xl"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Resumen de tu pedido</h2>
                <p className="text-xs uppercase tracking-[0.35em] text-muted">
                  {itemCount} {itemCount === 1 ? "pieza" : "piezas"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted transition hover:border-white/30 hover:text-white"
              >
                Cerrar
              </button>
            </header>

            <div className="flex-1 overflow-hidden">
              <div className="fade-top pointer-events-none absolute inset-x-0 top-[72px] h-6 bg-gradient-to-b from-background via-background/60 to-transparent" aria-hidden />
              <div className="fade-bottom pointer-events-none absolute inset-x-0 bottom-[9.5rem] h-6 bg-gradient-to-t from-background via-background/70 to-transparent sm:bottom-[10rem] md:bottom-[11rem]" aria-hidden />
              <div className="h-full overflow-y-auto px-6 py-6 md:py-7">
                {items.length === 0 ? (
                  <p className="text-sm text-muted">
                    Tu carrito está vacío. Explora el catálogo para añadir piezas.
                  </p>
                ) : (
                <ul className="space-y-5">
                  {items.map(({ product, qty }) => {
                    const cover = product.images[0]?.url ?? "/hero.jpg";
                    const prices = getProductPrices(product);
                    const secondaryPerUnit =
                      product.alternatePricing?.enabled &&
                      product.alternatePricing.amount &&
                      product.alternatePricing.currency
                        ? formatCurrency(
                            product.alternatePricing.amount,
                            product.alternatePricing.currency,
                          )
                        : null;
                    const secondarySubtotal =
                      secondaryPerUnit && product.alternatePricing?.amount
                        ? formatCurrency(
                            (product.alternatePricing.amount ?? 0) * qty,
                            product.alternatePricing.currency ?? "USD",
                          )
                        : null;
                    return (
                      <li key={product.slug} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                        <div className="relative h-16 w-14 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          <Image
                            src={cover}
                            alt={product.images[0]?.alt ?? product.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-1 text-sm">
                          <p className="line-clamp-2 font-medium text-white/90">{product.title}</p>
                          <div className="flex items-center justify-between text-xs text-muted">
                            <span>
                              {qty} x {prices.primary}
                            </span>
                            <span className="text-sm font-semibold text-accent">
                              {formatCurrency(product.price * qty, product.currency ?? "DOP")}
                            </span>
                          </div>
                          {secondaryPerUnit && secondarySubtotal && (
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-white/70">
                              <span>
                                {qty} x {secondaryPerUnit}
                              </span>
                              <span>{secondarySubtotal}</span>
                            </div>
                          )}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => remove(product.slug)}
                              className="text-xs uppercase tracking-[0.3em] text-muted transition hover:text-white"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              </div>
            </div>

            <footer className="space-y-4 border-t border-white/10 px-6 py-5">
              <div className="flex items-center justify-between text-sm">
                <span>Total estimado</span>
                <span className="text-base font-semibold text-accent">
                  {formatCurrency(totalAmount, totalCurrency)}
                </span>
              </div>
              {alternateTotals && (
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/70">
                  <span>Total alterno</span>
                  <span>{formatCurrency(alternateTotals.total, alternateTotals.currency)}</span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className={clsx(
                    "inline-flex items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-black transition",
                    items.length ? "hover:opacity-90 shadow-glow" : "cursor-not-allowed opacity-40",
                  )}
                  aria-disabled={!items.length}
                  onClick={() => {
                    if (!items.length) return;
                    setOpen(false);
                  }}
                >
                  Confirmar por WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setOpen(false);
                  }}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!items.length}
                >
                  Vaciar carrito
                </button>
              </div>
            </footer>
          </aside>
        </div>
      , document.body)}
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
