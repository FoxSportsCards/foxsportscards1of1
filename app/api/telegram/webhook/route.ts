import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { answerTelegramCallback, editTelegramMessage } from "@/lib/telegram";

export const runtime = "edge";

type TelegramUpdate = {
  callback_query?: {
    id: string;
    data?: string;
    message?: {
      message_id?: number;
      chat?: {
        id?: number | string;
      };
    };
  };
};

function isAllowedTelegramRequest(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return false;
  return request.headers.get("x-telegram-bot-api-secret-token") === secret;
}

export async function POST(request: Request) {
  if (!isAllowedTelegramRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "El servicio no está disponible temporalmente." }, { status: 503 });
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  const callback = update?.callback_query;
  const data = callback?.data;

  if (!callback?.id || !data) {
    return NextResponse.json({ ok: true });
  }

  const [action, orderId] = data.split(":");
  if (!orderId || (action !== "confirm" && action !== "reject")) {
    await answerTelegramCallback(callback.id, "Acción no válida.");
    return NextResponse.json({ ok: true });
  }

  const result =
    action === "confirm"
      ? await admin.rpc("confirm_customer_order", { order_id: orderId })
      : await admin.rpc("reject_customer_order", { order_id: orderId, note: "Rechazado desde Telegram" });

  if (result.error || !result.data) {
    await answerTelegramCallback(callback.id, "No se pudo procesar.");
    return NextResponse.json({ ok: true });
  }

  const statusText = action === "confirm" ? "confirmado" : "rechazado";
  await answerTelegramCallback(callback.id, `Pedido ${statusText}.`);

  const messageId = callback.message?.message_id;
  const chatId = callback.message?.chat?.id;
  if (chatId && messageId) {
    await editTelegramMessage(chatId, messageId, `Pedido ${result.data.order_number}: ${statusText}.`);
  }

  return NextResponse.json({ ok: true });
}
