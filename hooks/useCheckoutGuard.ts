"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type CheckoutGuardStatus = "loading" | "ok" | "no-session" | "no-profile";

export function useCheckoutGuard(): CheckoutGuardStatus {
  const [status, setStatus] = useState<CheckoutGuardStatus>("loading");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus("ok");
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setStatus("no-session");
        return;
      }

      const { data } = await supabase
        .from("customer_profiles")
        .select("full_name, whatsapp")
        .eq("id", session.user.id)
        .maybeSingle();

      setStatus(!data?.full_name || !data?.whatsapp ? "no-profile" : "ok");
    });
  }, []);

  return status;
}
