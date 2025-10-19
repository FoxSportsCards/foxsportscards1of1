"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Lanzamientos", href: "/lanzamientos" },
  { label: "Historias", href: "/sobre" },
  { label: "Preguntas", href: "/preguntas" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/65 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-heading font-semibold tracking-tight">
            <span className="text-accent">fox</span>sportscards
          </Link>
          <span className="hidden border-l border-white/10 pl-3 text-xs uppercase tracking-[0.35em] text-muted sm:inline">
            Premium Vault
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
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-white/30 hover:text-white md:inline-flex"
          >
            Instagram
          </a>
          <a
            href="https://wa.me/18290000000"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black shadow-glow transition hover:bg-accent-soft"
          >
            Concierge WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
