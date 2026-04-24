import type { Database } from "@/types/supabase";

export type CustomerProfile = Database["public"]["Tables"]["customer_profiles"]["Row"];
export type CustomerOrder = Database["public"]["Tables"]["customer_orders"]["Row"];

export type CustomerSummary = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  deliveryNotes?: string | null;
};
