"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/pricing";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const WHATSAPP_NUMBER = "18492617328";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const items = useCart((state) => state.items);
  const remove = useCart((state) => state.remove);
  const clear = useCart((state) => state.clear);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const totalCurrency = items[0]?.product.currency ?? "DOP";
  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [items],
  );

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
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-black shadow-glow">
            {itemCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background/95 text-white shadow-2xl backdrop-blur-xl sm:max-w-lg"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">Resumen de tu pedido</h2>
                <p className="text-xs uppercase tracking-[0.35em] text-muted">
                  {itemCount} {itemCount === 1 ? "pieza" : "piezas"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-muted transition hover:border-white/30 hover:text-white"
              >
                Cerrar
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <p className="text-sm text-muted">
                  Tu carrito est\u00E1 vac\u00EDo. Explora el cat\u00E1logo para a\u00F1adir piezas.
                </p>
              ) : (
                <ul className="space-y-6">
                  {items.map(({ product, qty }) => {
                    const cover = product.images[0]?.url ?? "/hero.jpg";
                    return (
                      <li key={product.slug} className="flex gap-4">
                        <div className="relative h-20 w-16 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          <Image
                            src={cover}
                            alt={product.images[0]?.alt ?? product.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between text-sm">
                          <div>
                            <p className="font-medium text-white/90">{product.title}</p>
                            <p className="text-xs text-muted">
                              {qty} \u00D7 {formatCurrency(product.price, product.currency ?? "DOP")}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-accent">
                              {formatCurrency(product.price * qty, product.currency ?? "DOP")}
                            </span>
                            <button
                              type="button"
                              onClick={() => remove(product.slug)}
                              className="text-xs text-muted transition hover:text-white"
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

            <footer className="space-y-4 border-t border-white/10 px-6 py-6">
              <div className="flex items-center justify-between text-sm">
                <span>Total estimado</span>
                <span className="text-base font-semibold text-accent">
                  {formatCurrency(totalAmount, totalCurrency)}
                </span>
              </div>

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
        </>
      )}
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
