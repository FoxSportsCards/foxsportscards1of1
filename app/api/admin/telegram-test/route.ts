import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { sendTelegramTestNotification } from "@/lib/telegram";

export const runtime = "edge";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const result = await sendTelegramTestNotification();

  if (!result.ok) {
    const message =
      result.reason === "missing-token"
        ? "Falta conectar el token del bot en producción."
        : result.reason === "missing-chat-id"
          ? "Falta conectar el chat de Telegram."
          : "No se pudo enviar la prueba de Telegram.";

    return NextResponse.json({ error: message }, { status: 503 });
  }

  return NextResponse.json({ ok: true, messageId: result.messageId });
}
