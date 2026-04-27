import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "edge";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ isAdmin: false }, { status: 200 });
  return NextResponse.json({ isAdmin: true });
}
