"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/pricing";
import type { CartLine } from "@/lib/whatsapp";
import type { CustomerOrder, ProductInventory } from "@/types/account";

type InventoryView = {
  productSlug: string;
  productTitle: string;
  categoryLabel: string;
  sanityQuantity: number | null;
  status: string | null;
  row: ProductInventory | null;
};

type DashboardSummary = {
  confirmedCount: number;
  pendingCount: number;
  revenue: Array<{ currency: string; total: number }>;
};

const STATUS_LABELS: Record<CustomerOrder["status"], string> = {
  requested: "Solicitado",
  confirmed: "Confirmado",
  rejected: "Rechazado",
  paid: "Pagado",
  shipped: "Enviado",
  completed: "Completado",
  cancelled: "Cancelado",
};

function parseItems(order: CustomerOrder): CartLine[] {
  return Array.isArray(order.items) ? (order.items as unknown as CartLine[]) : [];
}

function getCustomerText(order: CustomerOrder) {
  const snapshot = order.customer_snapshot;
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return "Cliente sin perfil";
  const data = snapshot as Record<string, unknown>;
  return [data.full_name, data.whatsapp, data.phone, data.email].filter(Boolean).join(" | ") || "Cliente sin perfil";
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function formatRevenue(summary: DashboardSummary) {
  if (!summary.revenue.length) return "RD$0";
  return summary.revenue
    .map((entry) => formatCurrency(entry.total, entry.currency, "es"))
    .join(" / ");
}

function getFriendlyError(error: unknown, fallback: string) {
  if (!(error instanceof Error) || !error.message) return fallback;
  const message = error.message.toLowerCase();
  const safeMessages = [
    "tu sesión expiró",
    "no tienes acceso",
    "no se pudo",
    "no se pudieron",
    "falta seleccionar",
    "acción no válida",
  ];
  return safeMessages.some((safeMessage) => message.includes(safeMessage)) ? error.message : fallback;
}

export default function AdminOrdersClient() {
  const supabase = getSupabaseBrowserClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryView[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({ confirmedCount: 0, pendingCount: 0, revenue: [] });
  const [activePanel, setActivePanel] = useState<"orders" | "inventory">("orders");
  const [status, setStatus] = useState("requested");
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("all");
  const [inventoryStatus, setInventoryStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSessionToken(data.session?.access_token ?? null);
    });
  }, [supabase]);

  async function apiFetch(path: string, init?: RequestInit) {
    if (!sessionToken) throw new Error("Debes iniciar sesión como administrador.");
    const response = await fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${sessionToken}`,
        ...(init?.headers ?? {}),
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error ?? "Solicitud fallida.");
    return payload;
  }

  async function loadDashboard() {
    if (!sessionToken) return;
    setLoading(true);
    setError(null);
    try {
      const [ordersPayload, inventoryPayload] = await Promise.all([
        apiFetch(`/api/admin/orders?status=${status}`),
        apiFetch("/api/admin/inventory"),
      ]);
      setOrders(ordersPayload.orders ?? []);
      setSummary(ordersPayload.summary ?? { confirmedCount: 0, pendingCount: 0, revenue: [] });
      setInventory(inventoryPayload.inventory ?? []);
    } catch (loadError) {
      setError(getFriendlyError(loadError, "No se pudo cargar el panel. Inténtalo de nuevo."));
    } finally {
      setLoading(false);
    }
  }

  const inventoryCategories = useMemo(() => {
    return Array.from(new Set(inventory.map((item) => item.categoryLabel).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [inventory]);

  const visibleInventory = useMemo(() => {
    const search = normalize(inventorySearch);
    return inventory.filter((item) => {
      const quantity = item.row?.quantity ?? item.sanityQuantity ?? 0;
      const textMatch =
        !search ||
        [item.productTitle, item.productSlug, item.categoryLabel]
          .filter(Boolean)
          .some((value) => normalize(value).includes(search));
      const categoryMatch = inventoryCategory === "all" || item.categoryLabel === inventoryCategory;
      const statusMatch =
        inventoryStatus === "all" ||
        (inventoryStatus === "low" && quantity > 0 && quantity <= (item.row?.low_stock_threshold ?? 1)) ||
        (inventoryStatus === "out" && quantity <= 0) ||
        (inventoryStatus === "available" && quantity > 0);
      return textMatch && categoryMatch && statusMatch;
    });
  }, [inventory, inventoryCategory, inventorySearch, inventoryStatus]);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, status]);

  async function handleOrderAction(orderId: string, action: "confirm" | "reject") {
    setSavingId(orderId);
    setError(null);
    try {
      await apiFetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      await loadDashboard();
    } catch (actionError) {
      setError(getFriendlyError(actionError, "No se pudo actualizar el pedido. Inténtalo de nuevo."));
    } finally {
      setSavingId(null);
    }
  }

  async function handleInventorySave(item: InventoryView, quantity: number) {
    setSavingId(item.productSlug);
    setError(null);
    try {
      await apiFetch("/api/admin/inventory", {
        method: "PUT",
        body: JSON.stringify({
          productSlug: item.productSlug,
          productTitle: item.productTitle,
          quantity,
          trackInventory: true,
          lowStockThreshold: item.row?.low_stock_threshold ?? 1,
        }),
      });
      await loadDashboard();
    } catch (saveError) {
      setError(getFriendlyError(saveError, "No se pudo guardar el inventario. Inténtalo de nuevo."));
    } finally {
      setSavingId(null);
    }
  }

  if (!supabase) {
    return (
      <section className="container py-14">
        <div className="glass-card mx-auto max-w-2xl p-6 text-center text-sm text-red">
          El panel no está disponible temporalmente.
        </div>
      </section>
    );
  }

  if (!sessionToken) {
    return (
      <section className="container py-14">
        <div className="glass-card mx-auto max-w-2xl p-6 text-center">
          <h1 className="text-3xl font-heading font-bold text-ink">Panel admin</h1>
          <p className="mt-2 text-sm text-muted">Inicia sesión con un usuario autorizado para ver pedidos.</p>
          <Link href="/login" className="btn-primary mt-5">
            Iniciar sesión
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container space-y-8 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Operaciones</span>
          <h1 className="mt-3 text-4xl font-heading font-bold text-ink">Pedidos e inventario</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Gestiona pedidos, ventas y disponibilidad desde un solo lugar.
          </p>
        </div>
        <button type="button" onClick={loadDashboard} className="btn-ghost">
          Actualizar
        </button>
      </header>

      {error ? (
        <p className="rounded-2xl border border-red/20 bg-red/10 px-4 py-3 text-sm font-semibold text-red">{error}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Ventas confirmadas</p>
          <p className="mt-2 text-3xl font-heading font-bold text-ink">{formatRevenue(summary)}</p>
          <p className="mt-1 text-xs text-muted">{summary.confirmedCount} pedidos confirmados o en proceso</p>
        </div>
        <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Pendientes</p>
          <p className="mt-2 text-3xl font-heading font-bold text-ink">{summary.pendingCount}</p>
          <p className="mt-1 text-xs text-muted">Pedidos esperando confirmación</p>
        </div>
        <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Inventario visible</p>
          <p className="mt-2 text-3xl font-heading font-bold text-ink">{inventory.length}</p>
          <p className="mt-1 text-xs text-muted">Busca por producto o categoría</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-full border border-line bg-white p-1 shadow-soft sm:w-max">
        {[
          ["orders", "Pedidos"],
          ["inventory", "Inventario"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActivePanel(value as "orders" | "inventory")}
            className={clsx(
              "focus-ring rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em]",
              activePanel === value ? "bg-blue text-white" : "text-muted hover:text-blue",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activePanel === "orders" ? (
        <section className="glass-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-heading font-bold text-ink">Pedidos</h2>
            <div className="flex flex-wrap gap-2">
              {(["requested", "confirmed", "rejected", "all"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={clsx(
                    "focus-ring rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em]",
                    status === option ? "border-blue bg-blue text-white" : "border-line bg-white text-muted",
                  )}
                >
                  {option === "all" ? "Todos" : STATUS_LABELS[option]}
                </button>
              ))}
            </div>
          </div>
          {loading ? <p className="mt-4 text-sm text-muted">Cargando...</p> : null}
          <div className="mt-5 space-y-4">
            {orders.map((order) => {
              const items = parseItems(order);
              const canAct = order.status === "requested";
              return (
                <article key={order.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">
                        {order.order_number}
                      </p>
                      <h3 className="mt-1 text-lg font-heading font-bold text-ink">
                        {formatCurrency(Number(order.total_amount), order.currency, "es")}
                      </h3>
                      <p className="mt-1 text-xs text-muted">{getCustomerText(order)}</p>
                    </div>
                    <span className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-1 text-sm text-muted">
                    {items.map((item) => (
                      <li key={`${order.id}-${item.slug ?? item.title}`}>
                        {item.qty}x {item.title}
                      </li>
                    ))}
                  </ul>

                  {canAct ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleOrderAction(order.id, "confirm")}
                        disabled={savingId === order.id}
                        className="btn-primary disabled:opacity-60"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOrderAction(order.id, "reject")}
                        disabled={savingId === order.id}
                        className="btn-ghost text-red hover:border-red/35 hover:text-red disabled:opacity-60"
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
            {!loading && orders.length === 0 ? (
              <p className="rounded-2xl border border-line bg-white px-4 py-6 text-center text-sm text-muted">
                No hay pedidos en este estado.
              </p>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="glass-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-heading font-bold text-ink">Inventario</h2>
              <p className="mt-1 text-sm text-muted">
                Actualiza cantidades, revisa agotados y localiza productos rápido.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[620px]">
              <input
                type="search"
                value={inventorySearch}
                onChange={(event) => setInventorySearch(event.target.value)}
                placeholder="Buscar producto"
                className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-sm text-ink"
              />
              <select
                value={inventoryCategory}
                onChange={(event) => setInventoryCategory(event.target.value)}
                className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-sm text-ink"
              >
                <option value="all">Todas las categorías</option>
                {inventoryCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={inventoryStatus}
                onChange={(event) => setInventoryStatus(event.target.value)}
                className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-sm text-ink"
              >
                <option value="all">Todos los estados</option>
                <option value="available">Con stock</option>
                <option value="low">Stock bajo</option>
                <option value="out">Agotados</option>
              </select>
            </div>
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {visibleInventory.length} productos visibles
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleInventory.map((item) => {
              const currentQuantity = item.row?.quantity ?? item.sanityQuantity ?? 0;
              return (
                <InventoryRow
                  key={item.productSlug}
                  item={item}
                  currentQuantity={currentQuantity}
                  saving={savingId === item.productSlug}
                  onSave={handleInventorySave}
                />
              );
            })}
            {visibleInventory.length === 0 ? (
              <p className="rounded-2xl border border-line bg-white px-4 py-6 text-center text-sm text-muted md:col-span-2 xl:col-span-3">
                No hay productos con esos filtros.
              </p>
            ) : null}
          </div>
        </section>
      )}
    </section>
  );
}

function InventoryRow({
  item,
  currentQuantity,
  saving,
  onSave,
}: {
  item: InventoryView;
  currentQuantity: number;
  saving: boolean;
  onSave: (item: InventoryView, quantity: number) => Promise<void>;
}) {
  const [quantity, setQuantity] = useState(currentQuantity);

  useEffect(() => {
    setQuantity(currentQuantity);
  }, [currentQuantity]);

  return (
    <div className="rounded-2xl border border-line bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-ink">{item.productTitle}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">{item.categoryLabel}</p>
        </div>
        <input
          type="number"
          min={0}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(0, Number(event.target.value) || 0))}
          className="focus-ring w-24 rounded-full border border-line px-3 py-2 text-sm font-semibold text-ink"
        />
      </div>
      <button
        type="button"
        onClick={() => onSave(item, quantity)}
        disabled={saving}
        className="mt-3 w-full rounded-full border border-blue/25 bg-blue/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue disabled:opacity-60"
      >
        Guardar stock
      </button>
    </div>
  );
}
