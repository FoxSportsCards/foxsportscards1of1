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
        className="relative inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        Carrito
        {itemCount > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-black">
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
          <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background/95 text-white shadow-2xl backdrop-blur-xl">
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
                <p className="text-sm text-muted">Tu carrito está vacío. Explora el catálogo para añadir piezas.</p>
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
                              {qty} × {formatCurrency(product.price, product.currency ?? "DOP")}
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
                    items.length ? "hover:opacity-90" : "cursor-not-allowed opacity-40",
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
