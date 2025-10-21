"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import CartDrawer from "./CartDrawer";

const NAV_ITEMS = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Lanzamientos", href: "/lanzamientos" },
  { label: "Historias", href: "/sobre" },
  { label: "Preguntas", href: "/preguntas" },
];

const QUICK_LINKS = [
  {
    label: "Concierge VIP",
    description: "Agenda asesoría personalizada",
    href: "/contacto",
  },
  {
    label: "Vitrina diaria",
    description: "Explora las piezas activas",
    href: "/catalogo",
  },
  {
    label: "Drops programados",
    description: "Revisa próximos lanzamientos",
    href: "/lanzamientos",
  },
  {
    label: "Preguntas clave",
    description: "Todo sobre envíos y garantías",
    href: "/preguntas",
  },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/85 backdrop-blur-xl">
      <div className="container flex flex-col gap-3 py-3 md:grid md:h-20 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-3 text-white transition hover:text-accent">
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/60">
              <Image
                src="/zorro-logo-final.png"
                alt="Foxsportscards1of1"
                fill
                sizes="44px"
                className="object-contain"
                priority
              />
            </span>
            <span className="text-2xl font-heading font-semibold tracking-tight">
              <span className="text-accent">fox</span>sportscards<span className="text-accent">1of1</span>
            </span>
          </Link>
          <span className="hidden shrink-0 border-l border-white/10 pl-3 text-[11px] uppercase tracking-[0.35em] text-muted xl:inline">
            Vault curado premium
          </span>
        </div>

        <nav className="order-3 hidden items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm shadow-soft md:order-2 md:flex">
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "whitespace-nowrap rounded-full px-4 py-1.5 transition",
                  isActive
                    ? "bg-white/15 text-white shadow-glow"
                    : "text-muted hover:bg-white/10 hover:text-white",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 flex items-center gap-2 md:order-3 md:justify-end">
          <CartDrawer />
          <a
            href="https://www.instagram.com/foxsportscards1of1"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-white/30 hover:text-white lg:inline-flex"
          >
            Instagram
          </a>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-muted transition hover:border-white/35 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              Experiencias
              <ChevronDownIcon className={clsx("h-3 w-3 transition-transform", menuOpen && "rotate-180")} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-white/10 bg-background/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <ul className="space-y-1">
                  {QUICK_LINKS.map(({ label, description, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="block rounded-2xl px-4 py-3 transition hover:bg-white/8 hover:text-white"
                      >
                        <span className="block text-sm font-semibold text-white">{label}</span>
                        <span className="block text-xs text-muted">{description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <a
            href="https://wa.me/18492617328"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-[#f9d16f] px-5 py-2 text-sm font-semibold text-black shadow-glow transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 8"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className={className}
      aria-hidden="true"
    >
      <path d="M1 1.5 6 6.5 11 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
