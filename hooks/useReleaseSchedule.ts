"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

type CountdownParts = {
  label: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type ReleaseScheduleResult = {
  statusLabel: string;
  countdown?: CountdownParts;
  releaseDateLabel?: string;
  releaseDate?: Date;
  isPurchaseLocked: boolean;
};

const STATUS_LABELS: Record<NonNullable<Product["status"]> | "default", string> = {
  sold: "No disponible",
  reserved: "Reservado",
  upcoming: "Próximo lanzamiento",
  available: "Disponible",
  default: "Disponible",
};

function parseReleaseDate(value?: string | null): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildCountdown(diffMs: number): CountdownParts {
  const totalSeconds = Math.max(Math.ceil(diffMs / 1000), 0);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let label: string;
  if (days > 1) {
    label = `Disponible en ${days} días`;
  } else if (days === 1) {
    label = hours > 0 ? `Disponible en 1 día y ${hours} h` : "Disponible en 1 día";
  } else if (hours > 0) {
    label = minutes > 0 ? `Disponible en ${hours} h ${minutes} min` : `Disponible en ${hours} h`;
  } else if (minutes > 1) {
    label = `Disponible en ${minutes} min`;
  } else if (minutes === 1) {
    label = `Disponible en 1 min y ${seconds.toString().padStart(2, "0")} s`;
  } else if (seconds > 0) {
    label = `Disponible en ${seconds} s`;
  } else {
    label = "Disponible";
  }

  return {
    label,
    days,
    hours,
    minutes,
    seconds,
  };
}

export function useReleaseSchedule(
  status: Product["status"],
  releaseDate: string | null | undefined,
): ReleaseScheduleResult {
  const targetTimestamp = useMemo(() => parseReleaseDate(releaseDate), [releaseDate]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (!targetTimestamp) return undefined;
    if (status !== "upcoming") return undefined;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      const now = Date.now();
      setCurrentTime(now);
      if (intervalId && now >= targetTimestamp) {
        clearInterval(intervalId);
      }
    };

    // Ejecutamos un primer tick inmediato para sincronizar.
    tick();
    intervalId = setInterval(tick, 1000);
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [status, targetTimestamp]);

  const purchaseLocked =
    status === "upcoming" && targetTimestamp !== null && currentTime < targetTimestamp;

  const statusLabel =
    status === "sold"
      ? STATUS_LABELS.sold
      : status === "reserved"
        ? STATUS_LABELS.reserved
        : purchaseLocked
          ? STATUS_LABELS.upcoming
          : STATUS_LABELS.available;

  let countdown: CountdownParts | undefined;
  if (purchaseLocked && targetTimestamp !== null) {
    countdown = buildCountdown(targetTimestamp - currentTime);
  }

  const releaseDateInstance = targetTimestamp !== null ? new Date(targetTimestamp) : undefined;
  const releaseDateLabel =
    releaseDateInstance && purchaseLocked
      ? releaseDateInstance.toLocaleString("es-DO", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined;

  return {
    statusLabel,
    countdown,
    releaseDateLabel,
    releaseDate: releaseDateInstance,
    isPurchaseLocked: purchaseLocked,
  };
}
