"use client";

import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

type BannerAction = "agenda" | "link";

export type BannerCta = {
  href: string;
  label: string;
  external: boolean;
};

export type BannerItem = {
  id: string;
  message: string;
  cta: BannerCta;
  action: BannerAction;
};

type HeroBannerTickerProps = {
  items: BannerItem[];
  durationMs?: number;
};

export default function HeroBannerTicker({ items, durationMs = 6000 }: HeroBannerTickerProps) {
  const sanitized = useMemo(() => items.filter((item) => item.message.trim().length > 0), [items]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [sanitized.length]);

  useEffect(() => {
    if (sanitized.length <= 1) return undefined;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sanitized.length);
    }, durationMs);
    return () => clearInterval(interval);
  }, [sanitized.length, durationMs]);

  if (!sanitized.length) {
    return null;
  }

  const item = sanitized[Math.min(index, sanitized.length - 1)];

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (item.action === "agenda") {
        event.preventDefault();
        const target = document.querySelector("#agenda-drops");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
    [item.action],
  );

  return (
    <a
      key={item.id}
      href={item.cta.href}
      onClick={handleClick}
      target={item.action === "link" && item.cta.external ? "_blank" : undefined}
      rel={item.action === "link" && item.cta.external ? "noreferrer" : undefined}
      className="group relative flex max-w-[320px] items-center gap-2 overflow-hidden rounded-full border border-accent/30 bg-white/[0.08] px-3 py-1.5 text-white shadow-[0_10px_30px_rgba(255,215,0,0.12)] backdrop-blur sm:max-w-[420px] sm:px-4"
    >
      <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent/70 via-accent to-[#f7d87a] text-[12px] font-semibold text-black shadow-[0_0_10px_rgba(255,215,0,0.45)]">
        ✦
      </span>
      <span className="flex-1 truncate text-[10px] uppercase tracking-[0.22em] text-white/85 sm:text-[11px]">{item.message}</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-black transition group-hover:bg-white/90">
        {item.cta.label}
        <span aria-hidden>→</span>
      </span>
    </a>
  );
}

