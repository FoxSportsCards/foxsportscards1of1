"use client";

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

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-auto flex-wrap items-center justify-between gap-3 py-3 sm:h-20 sm:flex-nowrap sm:items-center sm:gap-4 sm:py-0">
        <div className="flex min-w-0 items-center gap-3 sm:flex-1">
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
          <span className="hidden shrink-0 border-l border-white/10 pl-3 text-[11px] uppercase tracking-[0.35em] text-muted lg:inline">
            Vault curado premium
          </span>
        </div>

        <nav className="hidden w-full items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm shadow-soft md:flex md:w-auto md:flex-1">
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

        <div className="flex items-center gap-2 sm:flex-1 sm:justify-end">
          <CartDrawer />
          <a
            href="https://www.instagram.com/foxsportscards1of1"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-white/30 hover:text-white lg:inline-flex"
          >
            Instagram
          </a>

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
