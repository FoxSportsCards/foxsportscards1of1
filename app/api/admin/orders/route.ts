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

const REVENUE_STATUSES: CustomerOrder["status"][] = ["confirmed", "paid", "shipped", "completed"];

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

  const [{ data: revenueRows, error: revenueError }, { count: pendingCount, error: pendingError }] = await Promise.all([
    auth.admin.from("customer_orders").select("total_amount,currency,status").in("status", REVENUE_STATUSES),
    auth.admin.from("customer_orders").select("id", { count: "exact", head: true }).eq("status", "requested"),
  ]);

  if (revenueError || pendingError) {
    return NextResponse.json({ error: revenueError?.message ?? pendingError?.message }, { status: 500 });
  }

  const revenueByCurrency = (revenueRows ?? []).reduce<Record<string, number>>((totals, order) => {
    const currency = order.currency ?? "DOP";
    totals[currency] = (totals[currency] ?? 0) + Number(order.total_amount ?? 0);
    return totals;
  }, {});

  return NextResponse.json({
    orders: data ?? [],
    summary: {
      confirmedCount: revenueRows?.length ?? 0,
      pendingCount: pendingCount ?? 0,
      revenue: Object.entries(revenueByCurrency).map(([currency, total]) => ({ currency, total })),
    },
  });
}
