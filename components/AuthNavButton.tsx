"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/locale";

type AuthNavButtonProps = {
  locale?: Locale;
  mobile?: boolean;
};

export default function AuthNavButton({ locale = "es", mobile = false }: AuthNavButtonProps) {
  const [user, setUser] = useState<User | null>(null);

  const copy =
    locale === "en"
      ? {
          signIn: "Sign in",
          account: "Account",
          signOut: "Sign out",
        }
      : {
          signIn: "Entrar",
          account: "Cuenta",
          signOut: "Salir",
        };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  if (mobile) {
    return (
      <div className="mt-2 grid gap-2">
        <Link
          href={user ? "/cuenta" : "/login"}
          className="inline-flex items-center justify-center rounded-2xl border border-blue/20 bg-blue/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-blue"
        >
          {user ? copy.account : copy.signIn}
        </Link>
        {user ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="focus-ring rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted"
          >
            {copy.signOut}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="hidden items-center rounded-full border border-line bg-white p-1 shadow-soft md:flex">
      <Link
        href={user ? "/cuenta" : "/login"}
        className={clsx(
          "focus-ring rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]",
          user ? "bg-blue text-white" : "text-muted hover:text-blue",
        )}
      >
        {user ? copy.account : copy.signIn}
      </Link>
      {user ? (
        <button
          type="button"
          onClick={handleSignOut}
          className="focus-ring rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-red"
        >
          {copy.signOut}
        </button>
      ) : null}
    </div>
  );
}
