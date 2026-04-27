import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { notifyLowStockAfterOrder, syncConfirmedInventoryToSanity } from "@/lib/orderInventory";
import {
  buildPostConfirmButtons,
  editTelegramMessage,
  formatTelegramOrderStatusUpdate,
} from "@/lib/telegram";

export const runtime = "edge";

type RouteContext = {
  params: {
    id: string;
  };
};

type ActionPayload = {
  action?: "confirm" | "reject";
  note?: string | null;
};

async function syncTelegramStatus(
  messageId: number | null,
  text: string,
  buttons?: ReturnType<typeof buildPostConfirmButtons>,
) {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!chatId || !messageId) return;
  await editTelegramMessage(chatId, messageId, text, buttons);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const payload = (await request.json().catch(() => null)) as ActionPayload | null;
  const action = payload?.action;

  if (action !== "confirm" && action !== "reject") {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  const result =
    action === "confirm"
      ? await auth.admin.rpc("confirm_customer_order", { order_id: params.id })
      : await auth.admin.rpc("reject_customer_order", { order_id: params.id, note: payload?.note ?? null });

  if (result.error || !result.data) {
    return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 400 });
  }

  const sanitySync = action === "confirm" ? await syncConfirmedInventoryToSanity(auth.admin, result.data.items) : [];

  if (action === "confirm") {
    await notifyLowStockAfterOrder(auth.admin, result.data.items);
  }

  await syncTelegramStatus(
    result.data.telegram_message_id,
    formatTelegramOrderStatusUpdate(
      result.data,
      action === "confirm" ? "confirmado" : "rechazado",
      "Acción ejecutada desde el panel admin.",
    ),
    action === "confirm" ? buildPostConfirmButtons(result.data) : undefined,
  );

  return NextResponse.json({ order: result.data, sanitySync });
}
