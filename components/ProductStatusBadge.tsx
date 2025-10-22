"use client";

import { useReleaseSchedule } from "@/hooks/useReleaseSchedule";
import type { Product } from "@/types/product";

type ProductStatusBadgeProps = {
  status: Product["status"];
  releaseDate: string | null | undefined;
};

export default function ProductStatusBadge({ status, releaseDate }: ProductStatusBadgeProps) {
  const { statusLabel, countdown, releaseDateLabel } = useReleaseSchedule(status, releaseDate);

  return (
    <div className="space-y-1">
      <span className="inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/70">
        {statusLabel}
      </span>
      {countdown && (
        <p className="text-xs font-medium text-accent" aria-live="polite">
          {countdown.label}
          {releaseDateLabel ? (
            <span className="ml-1 text-[11px] uppercase tracking-[0.26em] text-white/50">({releaseDateLabel})</span>
          ) : null}
        </p>
      )}
    </div>
  );
}

