import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import type { CustomerOrder } from "@/types/account";

export const runtime = "edge";

const ORDER_STATUSES: CustomerOrder["status"][] = [
  "requested",
  "confirmed",
  "rejected",
  "paid",
  "shipped",
  "completed",
  "cancelled",
];

function isOrderStatus(value: string): value is CustomerOrder["status"] {
  return ORDER_STATUSES.includes(value as CustomerOrder["status"]);
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 100);

  let query = auth.admin
    .from("customer_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status && status !== "all" && isOrderStatus(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
