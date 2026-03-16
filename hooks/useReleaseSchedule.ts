"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/locale";
import { formatLocaleTag } from "@/lib/locale";
import type { Product } from "@/types/product";

type CountdownParts = {
  label: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type StatusKey = "available" | "reserved" | "sold" | "upcoming";

type ReleaseScheduleResult = {
  statusKey: StatusKey;
  statusLabel: string;
  countdown?: CountdownParts;
  releaseDateLabel?: string;
  releaseDate?: Date;
  isPurchaseLocked: boolean;
};

const STATUS_LABELS: Record<Locale, Record<StatusKey, string>> = {
  es: {
    sold: "No disponible",
    reserved: "Reservado",
    upcoming: "Proximo lanzamiento",
    available: "Disponible",
  },
  en: {
    sold: "Unavailable",
    reserved: "Reserved",
    upcoming: "Upcoming release",
    available: "Available",
  },
};

function parseReleaseDate(value?: string | null): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildCountdown(diffMs: number, locale: Locale): CountdownParts {
  const totalSeconds = Math.max(Math.ceil(diffMs / 1000), 0);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let label = locale === "en" ? "Available now" : "Disponible ahora";

  if (locale === "en") {
    if (days > 1) label = `Available in ${days} days`;
    else if (days === 1) label = hours > 0 ? "Available in 1 day and a few hours" : "Available in 1 day";
    else if (hours > 0) label = minutes > 0 ? `Available in ${hours}h ${minutes}m` : `Available in ${hours}h`;
    else if (minutes > 0) label = `Available in ${minutes}m`;
    else if (seconds > 0) label = `Available in ${seconds}s`;
  } else {
    if (days > 1) label = `Disponible en ${days} dias`;
    else if (days === 1) label = hours > 0 ? "Disponible en 1 dia y unas horas" : "Disponible en 1 dia";
    else if (hours > 0) label = minutes > 0 ? `Disponible en ${hours} h ${minutes} min` : `Disponible en ${hours} h`;
    else if (minutes > 0) label = `Disponible en ${minutes} min`;
    else if (seconds > 0) label = `Disponible en ${seconds} s`;
  }

  return { label, days, hours, minutes, seconds };
}

export function useReleaseSchedule(
  status: Product["status"],
  releaseDate: string | null | undefined,
  locale: Locale = "es",
): ReleaseScheduleResult {
  const targetTimestamp = useMemo(() => parseReleaseDate(releaseDate), [releaseDate]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (!targetTimestamp || status !== "upcoming") return;
    const tick = () => setCurrentTime(Date.now());
    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [status, targetTimestamp]);

  const isPurchaseLocked =
    status === "upcoming" && targetTimestamp !== null && currentTime < targetTimestamp;

  const statusKey: StatusKey =
    status === "sold" ? "sold" : status === "reserved" ? "reserved" : isPurchaseLocked ? "upcoming" : "available";

  const countdown =
    isPurchaseLocked && targetTimestamp !== null ? buildCountdown(targetTimestamp - currentTime, locale) : undefined;

  const releaseDateInstance = targetTimestamp !== null ? new Date(targetTimestamp) : undefined;
  const releaseDateLabel =
    releaseDateInstance && isPurchaseLocked
      ? releaseDateInstance.toLocaleString(formatLocaleTag(locale), {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined;

  return {
    statusKey,
    statusLabel: STATUS_LABELS[locale][statusKey],
    countdown,
    releaseDateLabel,
    releaseDate: releaseDateInstance,
    isPurchaseLocked,
  };
}

