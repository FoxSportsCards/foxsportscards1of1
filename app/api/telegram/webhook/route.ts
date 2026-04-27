import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { syncConfirmedInventoryToSanity } from "@/lib/orderInventory";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  answerTelegramCallback,
  editTelegramMessage,
  formatTelegramOrderStatusUpdate,
  hasValidTelegramWebhookSecret,
} from "@/lib/telegram";
import type { Database } from "@/types/supabase";

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

type TelegramCallback = NonNullable<TelegramUpdate["callback_query"]>;

function getActionErrorMessage(action: "confirm" | "reject", message?: string) {
  const safeMessage = message ?? "";
  if (safeMessage.includes("insufficient_stock")) return "No se pudo confirmar: stock insuficiente.";
  if (safeMessage.includes("inventory_already_applied")) return "No se puede rechazar: el pedido ya fue confirmado.";
  if (safeMessage.includes("order_closed")) return "Ese pedido ya está cerrado.";
  if (safeMessage.includes("order_not_found")) return "No se encontró el pedido.";
  return action === "confirm" ? "No se pudo confirmar el pedido." : "No se pudo rechazar el pedido.";
}

function isAdminChat(callback: TelegramCallback) {
  const expectedChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const chatId = callback.message?.chat?.id;
  return Boolean(expectedChatId && chatId && String(chatId) === expectedChatId);
}

async function isTrustedCallbackWithoutSecret(
  admin: SupabaseClient<Database>,
  callback: TelegramCallback,
  orderId: string,
) {
  if (!isAdminChat(callback)) return false;

  const messageId = callback.message?.message_id;
  if (!messageId) return true;

  const { data } = await admin
    .from("customer_orders")
    .select("telegram_message_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!data?.telegram_message_id) return true;
  return data.telegram_message_id === messageId;
}

export async function POST(request: Request) {
  const hasValidSecret = hasValidTelegramWebhookSecret(request);

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

  const admin = getSupabaseAdminClient();
  if (!admin) {
    await answerTelegramCallback(callback.id, "El servicio no está disponible.");
    return NextResponse.json({ error: "El servicio no está disponible temporalmente." }, { status: 503 });
  }

  if (!hasValidSecret) {
    const trusted = await isTrustedCallbackWithoutSecret(admin, callback, orderId);
    if (!trusted) {
      await answerTelegramCallback(callback.id, "No se pudo validar la acción.");
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const result =
    action === "confirm"
      ? await admin.rpc("confirm_customer_order", { order_id: orderId })
      : await admin.rpc("reject_customer_order", { order_id: orderId, note: "Rechazado desde Telegram" });

  if (result.error || !result.data) {
    await answerTelegramCallback(callback.id, getActionErrorMessage(action, result.error?.message));
    return NextResponse.json({ ok: true });
  }

  if (action === "confirm") {
    await syncConfirmedInventoryToSanity(admin, result.data.items);
  }

  const statusText = action === "confirm" ? "confirmado" : "rechazado";
  await answerTelegramCallback(callback.id, `Pedido ${statusText}.`);

  const messageId = callback.message?.message_id;
  const chatId = callback.message?.chat?.id;
  if (chatId && messageId) {
    await editTelegramMessage(
      chatId,
      messageId,
      formatTelegramOrderStatusUpdate(result.data, statusText, "Acción ejecutada desde Telegram."),
    );
  }

  return NextResponse.json({ ok: true });
}
