"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/pricing";
import type { CartLine } from "@/lib/whatsapp";
import type { CustomerOrder, ProductInventory } from "@/types/account";

type InventoryView = {
  productSlug: string;
  productTitle: string;
  sanityQuantity: number | null;
  status: string | null;
  row: ProductInventory | null;
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

export default function AdminOrdersClient() {
  const supabase = getSupabaseBrowserClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryView[]>([]);
  const [status, setStatus] = useState("requested");
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
    if (!sessionToken) throw new Error("Debes iniciar sesion como admin.");
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
      setInventory(inventoryPayload.inventory ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el panel.");
    } finally {
      setLoading(false);
    }
  }

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
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar el pedido.");
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
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar inventario.");
    } finally {
      setSavingId(null);
    }
  }

  if (!supabase) {
    return (
      <section className="container py-14">
        <div className="glass-card mx-auto max-w-2xl p-6 text-center text-sm text-red">
          Supabase no esta configurado.
        </div>
      </section>
    );
  }

  if (!sessionToken) {
    return (
      <section className="container py-14">
        <div className="glass-card mx-auto max-w-2xl p-6 text-center">
          <h1 className="text-3xl font-heading font-bold text-ink">Panel admin</h1>
          <p className="mt-2 text-sm text-muted">Inicia sesion con un usuario autorizado para ver pedidos.</p>
          <Link href="/login" className="btn-primary mt-5">
            Iniciar sesion
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
            Confirma pedidos, descuenta inventario y ajusta stock sin afectar la vitrina principal.
          </p>
        </div>
        <button type="button" onClick={loadDashboard} className="btn-ghost">
          Actualizar
        </button>
      </header>

      {error ? (
        <p className="rounded-2xl border border-red/20 bg-red/10 px-4 py-3 text-sm font-semibold text-red">{error}</p>
      ) : null}

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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-card p-5">
          <h2 className="text-2xl font-heading font-bold text-ink">Pedidos</h2>
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

        <section className="glass-card p-5">
          <h2 className="text-2xl font-heading font-bold text-ink">Inventario</h2>
          <div className="mt-5 max-h-[760px] space-y-3 overflow-y-auto pr-1">
            {inventory.map((item) => {
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
          </div>
        </section>
      </div>
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
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">{item.productSlug}</p>
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
