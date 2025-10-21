"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Cat\u00e1logo", href: "/catalogo" },
  { label: "Lanzamientos", href: "/lanzamientos" },
  { label: "Historias", href: "/sobre" },
  { label: "Preguntas", href: "/preguntas" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-20 flex-wrap items-center justify-between gap-4 py-3 sm:flex-nowrap sm:py-0">
        <div className="flex flex-1 items-center gap-3">
          <Link href="/" className="text-2xl font-heading font-semibold tracking-tight text-white transition hover:text-accent">
            <span className="text-accent">fox</span>sportscards<span className="text-accent">1of1</span>
          </Link>
          <span className="hidden border-l border-white/10 pl-3 text-[11px] uppercase tracking-[0.35em] text-muted lg:inline">
            Vault curado premium
          </span>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm shadow-soft md:flex">
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "rounded-full px-4 py-1.5 transition",
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

        <div className="flex items-center gap-2">
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
            <span>WhatsApp</span>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.7 15.14L2 22l4.99-1.31A10 10 0 1 0 12 2Zm5.2 14.27c-.23.66-1.36 1.25-1.88 1.29-.48.04-1.05.06-1.7-.1a14.82 14.82 0 0 1-4.65-2.4 10.68 10.68 0 0 1-2-2.44c-.23-.4-.48-.87-.6-1.37-.18-.74.4-1.14.88-1.29.23-.07.5-.12.78.2.18.21.35.47.48.73.15.28.2.43.08.62-.13.2-.2.33-.31.53-.1.16-.2.33-.09.52.11.19.47.85 1 1.38a6.8 6.8 0 0 0 2.25 1.5c.27.12.43.1.59-.06.15-.16.66-.78.84-1.05.18-.26.35-.22.6-.13.24.08 1.52.72 1.78.85.26.13.43.2.5.32a1.6 1.6 0 0 1 .11 1.03Z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
