"use client";

import { MouseEvent, useCallback } from "react";

type BannerAction = "agenda" | "link";

type BannerCta = {
  href: string;
  label: string;
  external: boolean;
};

type HeroBannerTickerProps = {
  message: string;
  cta: BannerCta;
  action: BannerAction;
  marquee?: boolean;
};

export default function HeroBannerTicker({ message, cta, action, marquee = false }: HeroBannerTickerProps) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (action === "agenda") {
        event.preventDefault();
        const target = document.querySelector("#agenda-drops");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
    [action],
  );

  return (
    <a
      href={cta.href}
      onClick={handleClick}
      target={action === "link" && cta.external ? "_blank" : undefined}
      rel={action === "link" && cta.external ? "noreferrer" : undefined}
      className="group relative mx-auto flex max-w-[640px] items-center gap-2 overflow-hidden rounded-full border border-accent/30 bg-white/5 px-3 py-2 text-white shadow-[0_12px_35px_rgba(255,215,0,0.12)] backdrop-blur transition hover:border-accent/60 hover:shadow-[0_18px_45px_rgba(255,215,0,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:px-4 sm:py-2.5"
    >
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent/70 via-accent to-[#f7d87a] text-black shadow-[0_0_12px_rgba(255,215,0,0.5)]">
        ✦
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div
          className={`banner-marquee-content text-[10px] uppercase tracking-[0.28em] text-white/85 sm:text-[11px] ${
            marquee ? "animate-marquee" : ""
          }`}
          style={marquee ? { animationDuration: `${Math.min(Math.max(message.length / 6, 12), 22)}s` } : undefined}
        >
          <span>{message}</span>
          {marquee && <span aria-hidden>{message}</span>}
        </div>
        <span className="pointer-events-none absolute left-0 top-0 h-full w-5 bg-gradient-to-r from-[#05070b] via-[#05070b]/60 to-transparent" />
        <span className="pointer-events-none absolute right-0 top-0 h-full w-5 bg-gradient-to-l from-[#05070b] via-[#05070b]/60 to-transparent" />
      </div>
      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-black transition group-hover:bg-white/90 sm:px-4 sm:text-[11px]">
        {cta.label}
        <span aria-hidden>→</span>
      </span>
    </a>
  );
}

