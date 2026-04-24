"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CartLine } from "@/lib/whatsapp";
import type { CustomerProfile, CustomerSummary } from "@/types/account";
import type { Json } from "@/types/supabase";

export function profileToCustomerSummary(profile: CustomerProfile | null | undefined): CustomerSummary | null {
  if (!profile) return null;

  const address = [
    profile.address_line1,
    profile.address_line2,
    profile.city,
    profile.province,
    profile.postal_code,
    profile.country,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    address: address || null,
    deliveryNotes: profile.delivery_notes,
  };
}

function makeOrderNumber() {
  return `FSC-${Date.now().toString(36).toUpperCase()}`;
}

export async function createCustomerOrder(lines: CartLine[], whatsappMessage: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { status: "not-configured" as const, profile: null, orderNumber: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "anonymous" as const, profile: null, orderNumber: null };

  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const currency = lines.find((line) => line.currency)?.currency ?? "DOP";
  const totalAmount = lines.reduce((sum, line) => sum + line.qty * line.price, 0);
  const orderNumber = makeOrderNumber();

  const { error } = await supabase.from("customer_orders").insert({
    user_id: user.id,
    order_number: orderNumber,
    total_amount: totalAmount,
    currency,
    items: lines as unknown as Json,
    customer_snapshot: profile ? (profile as unknown as Json) : null,
    whatsapp_message: whatsappMessage,
  });

  if (error) {
    console.error("[orders] could not save order", error);
    return { status: "error" as const, profile, orderNumber: null };
  }

  return { status: "created" as const, profile, orderNumber };
}
