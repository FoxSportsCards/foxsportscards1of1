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
          user_id: string | null;
          order_number: string;
          status: "requested" | "confirmed" | "rejected" | "paid" | "shipped" | "completed" | "cancelled";
          total_amount: number;
          currency: string;
          items: Json;
          customer_snapshot: Json | null;
          whatsapp_message: string | null;
          inventory_applied: boolean;
          telegram_message_id: number | null;
          admin_notes: string | null;
          confirmed_at: string | null;
          rejected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_number: string;
          status?: "requested" | "confirmed" | "rejected" | "paid" | "shipped" | "completed" | "cancelled";
          total_amount: number;
          currency?: string;
          items: Json;
          customer_snapshot?: Json | null;
          whatsapp_message?: string | null;
          inventory_applied?: boolean;
          telegram_message_id?: number | null;
          admin_notes?: string | null;
          confirmed_at?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "requested" | "confirmed" | "rejected" | "paid" | "shipped" | "completed" | "cancelled";
          customer_snapshot?: Json | null;
          whatsapp_message?: string | null;
          inventory_applied?: boolean;
          telegram_message_id?: number | null;
          admin_notes?: string | null;
          confirmed_at?: string | null;
          rejected_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_inventory: {
        Row: {
          product_slug: string;
          product_title: string | null;
          quantity: number;
          reserved_quantity: number;
          track_inventory: boolean;
          low_stock_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          product_slug: string;
          product_title?: string | null;
          quantity?: number;
          reserved_quantity?: number;
          track_inventory?: boolean;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          product_title?: string | null;
          quantity?: number;
          reserved_quantity?: number;
          track_inventory?: boolean;
          low_stock_threshold?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          email: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      confirm_customer_order: {
        Args: { order_id: string };
        Returns: Database["public"]["Tables"]["customer_orders"]["Row"];
      };
      reject_customer_order: {
        Args: { order_id: string; note?: string | null };
        Returns: Database["public"]["Tables"]["customer_orders"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
