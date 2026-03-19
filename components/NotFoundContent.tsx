"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LOCALE_COOKIE_NAME, normalizeLocale, type Locale } from "@/lib/locale";

function readLocaleCookie(): Locale {
  if (typeof document === "undefined") return "es";
  const cookie = document.cookie
    .split("; ")
    .find((chunk) => chunk.startsWith(`${LOCALE_COOKIE_NAME}=`));
  return normalizeLocale(cookie?.split("=")[1]);
}

export default function NotFoundContent() {
  const [locale, setLocale] = useState<Locale>("es");
  const isEn = locale === "en";

  useEffect(() => {
    setLocale(readLocaleCookie());
  }, []);

  return (
    <section className="container py-16">
      <div className="glass-card mx-auto max-w-2xl p-8 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">404</p>
        <h1 className="mt-3 text-3xl font-heading font-bold text-ink sm:text-4xl">
          {isEn ? "This page does not exist" : "Esta página no existe"}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {isEn ? "Go back home to continue browsing the store." : "Vuelve al inicio para seguir navegando la tienda."}
        </p>
        <Link href="/" className="btn-primary mt-6">
          {isEn ? "Back to home" : "Volver al inicio"}
        </Link>
      </div>
    </section>
  );
}
