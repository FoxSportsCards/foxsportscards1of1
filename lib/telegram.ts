import { formatCurrency } from "@/lib/pricing";
import type { CartLine } from "@/lib/whatsapp";
import type { CustomerOrder, CustomerProfile } from "@/types/account";

type TelegramButton = {
  text: string;
  callback_data: string;
};

function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token) return { ok: false as const, reason: "missing-token" as const };
  if (!chatId) return { ok: false as const, reason: "missing-chat-id" as const };
  return { ok: true as const, token, chatId };
}

function getTelegramApiUrl(token: string, method: string) {
  return `https://api.telegram.org/bot${token}/${method}`;
}

function formatItems(items: CartLine[]) {
  return items
    .map((item) => {
      const currency = item.currency ?? "DOP";
      return `- ${item.qty}x ${item.title} - ${formatCurrency(item.price * item.qty, currency, "es")}`;
    })
    .join("\n");
}

function parseItems(order: CustomerOrder): CartLine[] {
  return Array.isArray(order.items) ? (order.items as unknown as CartLine[]) : [];
}

function formatProfile(profile: CustomerProfile | null) {
  if (!profile) return "Cliente sin perfil guardado.";
  const lines = [
    profile.full_name ? `Nombre: ${profile.full_name}` : null,
    profile.whatsapp ? `WhatsApp: ${profile.whatsapp}` : null,
    profile.phone ? `Celular: ${profile.phone}` : null,
    profile.email ? `Correo: ${profile.email}` : null,
    profile.address_line1 ? `Direccion: ${profile.address_line1}` : null,
    profile.address_line2 ? `Referencia: ${profile.address_line2}` : null,
    profile.city || profile.province ? `Zona: ${[profile.city, profile.province].filter(Boolean).join(", ")}` : null,
    profile.delivery_notes ? `Notas: ${profile.delivery_notes}` : null,
  ].filter(Boolean);
  return lines.length ? lines.join("\n") : "Cliente sin perfil guardado.";
}

export function isTelegramConfigured() {
  return getTelegramConfig().ok;
}

async function sendTelegramMessage(text: string, buttons?: TelegramButton[][]) {
  const config = getTelegramConfig();
  if (!config.ok) {
    console.error(`[telegram] ${config.reason}`);
    return { ok: false as const, messageId: null, reason: config.reason };
  }

  try {
    const response = await fetch(getTelegramApiUrl(config.token, "sendMessage"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
      }),
    });

    if (!response.ok) {
      console.error("[telegram] sendMessage failed", await response.text());
      return { ok: false as const, messageId: null, reason: "send-failed" as const };
    }

    const payload = (await response.json()) as { result?: { message_id?: number } };
    return { ok: true as const, messageId: payload.result?.message_id ?? null };
  } catch (error) {
    console.error("[telegram] sendMessage error", error);
    return { ok: false as const, messageId: null, reason: "send-failed" as const };
  }
}

export async function sendTelegramOrderNotification(order: CustomerOrder, profile: CustomerProfile | null) {
  const items = parseItems(order);
  const text = [
    `Nuevo pedido ${order.order_number}`,
    `Estado: ${order.status}`,
    `Total: ${formatCurrency(Number(order.total_amount), order.currency, "es")}`,
    "",
    formatItems(items),
    "",
    formatProfile(profile),
  ].join("\n");

  const buttons: TelegramButton[][] = [
    [
      { text: "Confirmar pedido", callback_data: `confirm:${order.id}` },
      { text: "Rechazar pedido", callback_data: `reject:${order.id}` },
    ],
  ];

  return sendTelegramMessage(text, buttons);
}

export async function sendTelegramTestNotification() {
  return sendTelegramMessage("Prueba desde el panel de Fox Sports Cards. Telegram está conectado.");
}

export async function answerTelegramCallback(callbackQueryId: string, text: string) {
  const config = getTelegramConfig();
  if (!config.ok) return;
  await fetch(getTelegramApiUrl(config.token, "answerCallbackQuery"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

export async function editTelegramMessage(chatId: number | string, messageId: number, text: string) {
  const config = getTelegramConfig();
  if (!config.ok) return;
  await fetch(getTelegramApiUrl(config.token, "editMessageText"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text }),
  });
}
