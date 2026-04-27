import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/pricing";
import { getServerLocale } from "@/lib/getServerLocale";

export const runtime = "edge";
export const revalidate = 300;

type LeaderboardEntry = {
  rank: number;
  name: string;
  total: number;
  orders: number;
  currency: string;
};

function formatName(fullName: string | null): string {
  if (!fullName?.trim()) return "Coleccionista";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

async function getMonthlyLeaderboard(): Promise<LeaderboardEntry[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const { data: orders } = await admin
    .from("customer_orders")
    .select("user_id, total_amount, currency")
    .in("status", ["confirmed", "paid", "completed", "shipped"])
    .gte("created_at", startOfMonth)
    .lt("created_at", startOfNextMonth)
    .not("user_id", "is", null);

  if (!orders?.length) return [];

  const userTotals = new Map<string, { total: number; orders: number; currency: string }>();
  for (const order of orders) {
    if (!order.user_id) continue;
    const existing = userTotals.get(order.user_id);
    if (existing) {
      existing.total += Number(order.total_amount);
      existing.orders += 1;
    } else {
      userTotals.set(order.user_id, {
        total: Number(order.total_amount),
        orders: 1,
        currency: order.currency ?? "DOP",
      });
    }
  }

  const sorted = Array.from(userTotals.entries())
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 10);

  if (!sorted.length) return [];

  const userIds = sorted.map(([id]) => id);
  const { data: profiles } = await admin
    .from("customer_profiles")
    .select("id, full_name")
    .in("id", userIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  return sorted.map(([userId, data], index) => ({
    rank: index + 1,
    name: formatName(profileMap.get(userId)?.full_name ?? null),
    total: data.total,
    orders: data.orders,
    currency: data.currency,
  }));
}

function getMonthLabel(locale: string): string {
  return new Date().toLocaleDateString(locale === "en" ? "en-US" : "es-DO", {
    month: "long",
    year: "numeric",
  });
}

function getResetDate(locale: string): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString(locale === "en" ? "en-US" : "es-DO", {
    day: "numeric",
    month: "long",
  });
}

function getTier(rank: number, isEn: boolean) {
  if (rank === 1) return { label: isEn ? "Champion of the month" : "Campeón del mes", emoji: "👑" };
  if (rank <= 3) return { label: "Elite", emoji: "🥇" };
  if (rank <= 6) return { label: isEn ? "Top Collector" : "Top Coleccionista", emoji: "🥈" };
  return { label: isEn ? "Collector" : "Coleccionista", emoji: "🥉" };
}

export default async function HallOfFamePage() {
  const locale = getServerLocale();
  const isEn = locale === "en";
  const leaderboard = await getMonthlyLeaderboard();
  const monthLabel = getMonthLabel(locale);
  const resetDate = getResetDate(locale);

  const champion = leaderboard[0];
  const podium = leaderboard.slice(1, 3);
  const rest = leaderboard.slice(3);

  return (
    <section className="container py-14 sm:py-16">
      <header className="mb-10 space-y-3 text-center">
        <span className="eyebrow">{isEn ? "Monthly ranking" : "Ranking mensual"}</span>
        <h1 className="text-4xl font-heading font-bold text-ink sm:text-5xl">
          Hall of Fame
        </h1>
        <p className="mx-auto max-w-xl text-sm text-muted capitalize">
          {monthLabel} · {isEn ? "Resets on" : "Se reinicia el"} {resetDate}
        </p>
      </header>

      {leaderboard.length === 0 ? (
        <div className="glass-card mx-auto max-w-xl p-12 text-center">
          <p className="text-4xl">🏆</p>
          <p className="mt-4 text-lg font-heading font-bold text-ink">
            {isEn ? "No rankings yet this month" : "Sin ranking este mes todavía"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {isEn
              ? "Every confirmed purchase counts. Be the first to claim the top spot."
              : "Cada compra confirmada cuenta. Sé el primero en tomar el primer lugar."}
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-4">

          {/* Campeón #1 */}
          {champion && (
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 shadow-[0_0_40px_rgba(251,191,36,0.18)]">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-white text-3xl shadow-soft">
                  👑
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600">
                    {getTier(1, isEn).label}
                  </p>
                  <p className="mt-0.5 truncate text-2xl font-heading font-bold text-ink">
                    {champion.name}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-amber-700">
                    {formatCurrency(champion.total, champion.currency, locale)} ·{" "}
                    {champion.orders}{" "}
                    {champion.orders === 1
                      ? isEn ? "order" : "pedido"
                      : isEn ? "orders" : "pedidos"}
                  </p>
                </div>
                <span className="shrink-0 text-5xl font-heading font-bold text-amber-200 select-none">
                  1
                </span>
              </div>
            </div>
          )}

          {/* Podio #2 y #3 */}
          {podium.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {podium.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-soft"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-2xl">
                    🥇
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue">
                      Elite
                    </p>
                    <p className="truncate text-base font-heading font-bold text-ink">
                      {entry.name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatCurrency(entry.total, entry.currency, locale)}
                    </p>
                  </div>
                  <span className="shrink-0 text-2xl font-heading font-bold text-line select-none">
                    {entry.rank}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* #4 al #10 */}
          {rest.length > 0 && (
            <div className="glass-card divide-y divide-line overflow-hidden p-0">
              {rest.map((entry) => {
                const tier = getTier(entry.rank, isEn);
                return (
                  <div key={entry.rank} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="w-6 shrink-0 text-center text-sm font-bold text-muted">
                      {entry.rank}
                    </span>
                    <span className="text-lg">{tier.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{entry.name}</p>
                      <p className="text-[11px] text-muted">{tier.label}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-heading font-bold text-ink">
                        {formatCurrency(entry.total, entry.currency, locale)}
                      </p>
                      <p className="text-[11px] text-muted">
                        {entry.orders} {entry.orders === 1 ? (isEn ? "order" : "pedido") : (isEn ? "orders" : "pedidos")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-xs text-muted">
            {isEn
              ? "Only confirmed purchases count. Rankings update every 5 minutes."
              : "Solo cuentan compras confirmadas. El ranking se actualiza cada 5 minutos."}
          </p>
        </div>
      )}
    </section>
  );
}
