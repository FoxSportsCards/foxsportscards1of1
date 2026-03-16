"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import CartDrawer from "./CartDrawer";
import { LOCALE_COOKIE_NAME, type Locale } from "@/lib/locale";

type HeaderProps = {
  locale: Locale;
};

const NAV_ITEMS = [
  { href: "/", label: { es: "Inicio", en: "Home" } },
  { href: "/catalogo", label: { es: "Catalogo", en: "Catalog" } },
  { href: "/lanzamientos", label: { es: "Lanzamientos", en: "Releases" } },
  { href: "/sobre", label: { es: "Nosotros", en: "About" } },
  { href: "/preguntas", label: { es: "FAQ", en: "FAQ" } },
  { href: "/contacto", label: { es: "Contacto", en: "Contact" } },
];

export default function Header({ locale }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>(locale);

  const copy = useMemo(
    () =>
      activeLocale === "en"
        ? {
            whatsapp: "WhatsApp",
            menu: "Menu",
            closeMenu: "Close",
            openMenu: "Open menu",
            closeLabel: "Close menu",
          }
        : {
            whatsapp: "WhatsApp",
            menu: "Menu",
            closeMenu: "Cerrar",
            openMenu: "Abrir menu",
            closeLabel: "Cerrar menu",
          },
    [activeLocale],
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === activeLocale) return;
    setActiveLocale(nextLocale);
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line/90 bg-white/80 backdrop-blur-xl">
      <div className="container">
        <div className="flex min-h-[84px] items-center justify-between gap-3 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3 lg:shrink-0">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              <Image
                src="/zorro-logo-final.png"
                alt="Fox Sports Cards 1of1"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block whitespace-nowrap text-base font-heading font-bold tracking-[0.02em] text-ink sm:text-xl">
                foxsportscards1of1
              </span>
              <span className="block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-blue sm:text-[11px]">
                SPORTS CARD BOUTIQUE
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-line bg-white px-2 py-1 shadow-soft lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.13em]",
                    isActive
                      ? "bg-blue text-white shadow-glow"
                      : "text-muted hover:bg-surface-elevated hover:text-ink",
                  )}
                >
                  {item.label[activeLocale]}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-full border border-line bg-white p-1 sm:flex">
              <button
                type="button"
                onClick={() => switchLocale("es")}
                className={clsx(
                  "focus-ring rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  activeLocale === "es" ? "bg-blue text-white" : "text-muted hover:text-blue",
                )}
                aria-label="Cambiar idioma a espanol"
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => switchLocale("en")}
                className={clsx(
                  "focus-ring rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  activeLocale === "en" ? "bg-blue text-white" : "text-muted hover:text-blue",
                )}
                aria-label="Switch language to English"
              >
                EN
              </button>
            </div>

            <a
              href="https://wa.me/18492617328"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-green/30 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-green shadow-soft hover:border-green/55 sm:inline-flex"
            >
              {copy.whatsapp}
            </a>

            <CartDrawer locale={activeLocale} />

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="focus-ring inline-flex h-10 items-center justify-center rounded-full border border-line bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink hover:border-blue/35 lg:hidden"
              aria-label={menuOpen ? copy.closeLabel : copy.openMenu}
              aria-expanded={menuOpen}
            >
              {menuOpen ? copy.closeMenu : copy.menu}
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-line bg-white/95 px-4 pb-4 pt-3 lg:hidden">
          <nav className="container grid gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.13em]",
                    isActive ? "bg-blue text-white" : "text-muted hover:bg-surface-elevated hover:text-ink",
                  )}
                >
                  {item.label[activeLocale]}
                </Link>
              );
            })}

            <div className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-line bg-white p-2">
              <button
                type="button"
                onClick={() => switchLocale("es")}
                className={clsx(
                  "focus-ring rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]",
                  activeLocale === "es" ? "bg-blue text-white" : "text-muted",
                )}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => switchLocale("en")}
                className={clsx(
                  "focus-ring rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]",
                  activeLocale === "en" ? "bg-blue text-white" : "text-muted",
                )}
              >
                EN
              </button>
            </div>

            <a
              href="https://wa.me/18492617328"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-center rounded-2xl border border-green/30 bg-green/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-green"
            >
              {copy.whatsapp}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
