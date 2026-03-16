"use client";

import clsx from "clsx";
import { useReleaseSchedule } from "@/hooks/useReleaseSchedule";
import type { Locale } from "@/lib/locale";
import type { Product } from "@/types/product";

type ProductStatusBadgeProps = {
  status: Product["status"];
  releaseDate: string | null | undefined;
  locale?: Locale;
};

const STATUS_STYLE: Record<string, string> = {
  available: "border-green/30 bg-green/10 text-green",
  reserved: "border-blue/35 bg-blue/10 text-blue",
  upcoming: "border-blue/35 bg-blue/10 text-blue",
  sold: "border-red/35 bg-red/10 text-red",
};

export default function ProductStatusBadge({ status, releaseDate, locale = "es" }: ProductStatusBadgeProps) {
  const { statusLabel, statusKey, countdown, releaseDateLabel } = useReleaseSchedule(status, releaseDate, locale);
  const style = STATUS_STYLE[statusKey] ?? "border-line bg-surface-elevated text-muted-strong";

  return (
    <div className="space-y-1">
      <span
        className={clsx(
          "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
          style,
        )}
      >
        {statusLabel}
      </span>
      {countdown ? (
        <p className="text-xs font-semibold text-blue" aria-live="polite">
          {countdown.label}
          {releaseDateLabel ? (
            <span className="ml-1 text-[11px] uppercase tracking-[0.14em] text-muted">({releaseDateLabel})</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

