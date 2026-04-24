"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import CartDrawer from "./CartDrawer";
import { LOCALE_COOKIE_NAME, type Locale } from "@/lib/locale";

const AuthNavButton = dynamic(() => import("./AuthNavButton"), {
  ssr: false,
});

type HeaderProps = {
  locale: Locale;
};

const NAV_ITEMS = [
  { href: "/", label: { es: "Inicio", en: "Home" } },
  { href: "/catalogo", label: { es: "Cat\u00e1logo", en: "Catalog" } },
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
            menu: "Men\u00fa",
            closeMenu: "Cerrar",
            openMenu: "Abrir men\u00fa",
            closeLabel: "Cerrar men\u00fa",
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
    <header className="relative sticky top-0 z-50 border-b border-line/90 bg-white/80 backdrop-blur-xl">
      <div className="container">
        <div className="flex min-h-[80px] items-center justify-between gap-2 py-3">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 pr-1 md:pr-2 lg:shrink-0 lg:flex-none lg:gap-3">
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
              <span className="block truncate text-base font-heading font-bold tracking-[0.02em] text-ink sm:text-lg md:text-xl">
                foxsportscards1of1
              </span>
              <span className="hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-blue lg:block lg:text-[11px]">
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

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center rounded-full border border-line bg-white p-1 md:flex">
              <button
                type="button"
                onClick={() => switchLocale("es")}
                className={clsx(
                  "focus-ring rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  activeLocale === "es" ? "bg-blue text-white" : "text-muted hover:text-blue",
                )}
                aria-label="Cambiar idioma a espa\u00f1ol"
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
              className="hidden rounded-full border border-green/30 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-green shadow-soft hover:border-green/55 lg:inline-flex"
            >
              {copy.whatsapp}
            </a>

            <AuthNavButton locale={activeLocale} />

            <CartDrawer locale={activeLocale} />

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="focus-ring inline-flex h-9 items-center justify-center rounded-full border border-line bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink hover:border-blue/35 lg:hidden"
              aria-label={menuOpen ? copy.closeLabel : copy.openMenu}
              aria-expanded={menuOpen}
            >
              {menuOpen ? copy.closeMenu : copy.menu}
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="absolute inset-x-0 top-full z-[60] h-[calc(100dvh-80px)] overflow-y-auto border-t border-line bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_28px_70px_rgba(15,23,42,0.16)] lg:hidden">
          <nav className="container grid gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.13em] transition-colors",
                    isActive
                      ? "bg-blue text-white shadow-glow"
                      : "bg-surface text-ink hover:bg-surface-elevated hover:text-blue",
                  )}
                >
                  {item.label[activeLocale]}
                </Link>
              );
            })}

            <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-soft">
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
              className="mt-2 inline-flex items-center justify-center rounded-2xl border border-green/30 bg-green/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-green shadow-soft"
            >
              {copy.whatsapp}
            </a>

            <AuthNavButton locale={activeLocale} mobile />
          </nav>
        </div>
      ) : null}
    </header>
  );
}
