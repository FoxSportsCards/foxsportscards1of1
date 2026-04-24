export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      customer_profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          whatsapp: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          province: string | null;
          postal_code: string | null;
          country: string | null;
          delivery_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          country?: string | null;
          delivery_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          country?: string | null;
          delivery_notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      customer_orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: "requested" | "confirmed" | "paid" | "shipped" | "completed" | "cancelled";
          total_amount: number;
          currency: string;
          items: Json;
          customer_snapshot: Json | null;
          whatsapp_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          status?: "requested" | "confirmed" | "paid" | "shipped" | "completed" | "cancelled";
          total_amount: number;
          currency?: string;
          items: Json;
          customer_snapshot?: Json | null;
          whatsapp_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "requested" | "confirmed" | "paid" | "shipped" | "completed" | "cancelled";
          customer_snapshot?: Json | null;
          whatsapp_message?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
