"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { formatCurrency } from "@/lib/pricing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/locale";
import type { CartLine } from "@/lib/whatsapp";
import type { CustomerOrder, CustomerProfile } from "@/types/account";

type AccountClientProps = {
  locale?: Locale;
};

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address_line1: string;
  address_line2: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  delivery_notes: string;
};

const emptyProfile: ProfileForm = {
  full_name: "",
  email: "",
  phone: "",
  whatsapp: "",
  address_line1: "",
  address_line2: "",
  city: "",
  province: "",
  postal_code: "",
  country: "República Dominicana",
  delivery_notes: "",
};

function mapProfileToForm(profile: CustomerProfile | null, user: User): ProfileForm {
  return {
    ...emptyProfile,
    email: profile?.email ?? user.email ?? "",
    full_name: profile?.full_name ?? (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : ""),
    phone: profile?.phone ?? "",
    whatsapp: profile?.whatsapp ?? "",
    address_line1: profile?.address_line1 ?? "",
    address_line2: profile?.address_line2 ?? "",
    city: profile?.city ?? "",
    province: profile?.province ?? "",
    postal_code: profile?.postal_code ?? "",
    country: profile?.country ?? "República Dominicana",
    delivery_notes: profile?.delivery_notes ?? "",
  };
}

function clean(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function parseOrderItems(order: CustomerOrder): CartLine[] {
  return Array.isArray(order.items) ? (order.items as unknown as CartLine[]) : [];
}

function getStatusLabel(status: CustomerOrder["status"], locale: Locale) {
  const labels: Record<CustomerOrder["status"], Record<Locale, string>> = {
    requested: { es: "Solicitado", en: "Requested" },
    confirmed: { es: "Confirmado", en: "Confirmed" },
    rejected: { es: "Rechazado", en: "Rejected" },
    paid: { es: "Pagado", en: "Paid" },
    shipped: { es: "Enviado", en: "Shipped" },
    completed: { es: "Completado", en: "Completed" },
    cancelled: { es: "Cancelado", en: "Cancelled" },
  };
  return labels[status]?.[locale] ?? status;
}

function getStatusBadgeClass(status: CustomerOrder["status"]) {
  if (status === "rejected" || status === "cancelled") {
    return "border-red/25 bg-red/10 text-red";
  }
  if (status === "requested") {
    return "border-blue/25 bg-blue/10 text-blue";
  }
  return "border-green/25 bg-green/10 text-green";
}

export default function AccountClient({ locale = "es" }: AccountClientProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEn = locale === "en";
  const copy = isEn
    ? {
        eyebrow: "My account",
        title: "Delivery profile and order history",
        text: "Save your details once and reuse them when sending orders through WhatsApp.",
        notConfigured: "Account access is temporarily unavailable. Please try again later.",
        notLogged: "You need to sign in to manage delivery details.",
        login: "Sign in",
        profile: "Delivery profile",
        orders: "Order history",
        save: "Save details",
        saving: "Saving...",
        saved: "Profile saved.",
        signOut: "Sign out",
        emptyOrders: "No orders saved yet. Confirm an order from the cart to create your first history item.",
        back: "Continue shopping",
        fields: {
          full_name: "Full name",
          email: "Email",
          phone: "Phone",
          whatsapp: "WhatsApp",
          address_line1: "Street / building / house number",
          address_line2: "Apartment or reference",
          city: "City",
          province: "Province",
          postal_code: "Postal code",
          country: "Country",
          delivery_notes: "Delivery notes",
        },
      }
    : {
        eyebrow: "Mi cuenta",
        title: "Datos de entrega e historial de pedidos",
        text: "Guarda tus datos una vez y los reutilizamos cuando confirmes pedidos por WhatsApp.",
        notConfigured: "Tu cuenta no está disponible temporalmente. Inténtalo más tarde.",
        notLogged: "Necesitas iniciar sesión para manejar tus datos de entrega.",
        login: "Iniciar sesión",
        profile: "Perfil de entrega",
        orders: "Historial de pedidos",
        save: "Guardar datos",
        saving: "Guardando...",
        saved: "Perfil guardado.",
        signOut: "Salir",
        emptyOrders: "No hay pedidos guardados todavía. Confirma un pedido desde el carrito para crear el primero.",
        back: "Seguir comprando",
        fields: {
          full_name: "Nombre completo",
          email: "Correo",
          phone: "Celular",
          whatsapp: "WhatsApp",
          address_line1: "Calle / edificio / número de casa",
          address_line2: "Apartamento o referencia",
          city: "Ciudad",
          province: "Provincia",
          postal_code: "Código postal",
          country: "País",
          delivery_notes: "Notas para delivery",
        },
      };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;
    let active = true;

    async function loadAccount() {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await client.auth.getUser();

      if (!active) return;

      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const [{ data: profileData }, { data: orderData }, adminCheck] = await Promise.all([
        client.from("customer_profiles").select("*").eq("id", currentUser.id).maybeSingle(),
        client
          .from("customer_orders")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(20),
        client.auth.getSession().then(({ data: { session } }) =>
          session
            ? fetch("/api/admin/me", {
                headers: { authorization: `Bearer ${session.access_token}` },
              }).then((r) => r.json()).catch(() => ({ isAdmin: false }))
            : Promise.resolve({ isAdmin: false }),
        ),
      ]);

      if (!active) return;
      setIsAdmin(adminCheck?.isAdmin === true);

      if (!active) return;
      setProfile(mapProfileToForm(profileData ?? null, currentUser));
      setOrders(orderData ?? []);
      setLoading(false);
    }

    loadAccount();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      loadAccount();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !user) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    const { error: saveError } = await supabase.from("customer_profiles").upsert({
      id: user.id,
      email: clean(profile.email) ?? user.email ?? null,
      full_name: clean(profile.full_name),
      phone: clean(profile.phone),
      whatsapp: clean(profile.whatsapp),
      address_line1: clean(profile.address_line1),
      address_line2: clean(profile.address_line2),
      city: clean(profile.city),
      province: clean(profile.province),
      postal_code: clean(profile.postal_code),
      country: clean(profile.country) ?? "República Dominicana",
      delivery_notes: clean(profile.delivery_notes),
    });

    setSaving(false);

    if (saveError) {
      setError(isEn ? "We could not save your details. Please try again." : "No pudimos guardar tus datos. Inténtalo de nuevo.");
      return;
    }

    setMessage(copy.saved);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (!supabase) {
    return (
      <section className="container py-14 sm:py-16">
        <div className="glass-card mx-auto max-w-2xl p-6 text-center">
          <p className="text-sm font-semibold text-red">{copy.notConfigured}</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="container py-14 sm:py-16">
        <div className="glass-card mx-auto max-w-2xl p-6 text-center">
          <p className="text-sm text-muted">{isEn ? "Loading account..." : "Cargando cuenta..."}</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="container py-14 sm:py-16">
        <div className="glass-card mx-auto max-w-2xl p-6 text-center">
          <p className="text-sm text-muted">{copy.notLogged}</p>
          <Link href="/login" className="btn-primary mt-5">
            {copy.login}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-14 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl space-y-4">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="text-4xl font-heading font-bold text-ink sm:text-5xl">{copy.title}</h1>
          <p className="text-sm text-muted">{copy.text}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <Link href="/admin/pedidos" className="btn-primary">
              {isEn ? "Admin panel" : "Panel admin"}
            </Link>
          ) : null}
          <Link href="/catalogo" className="btn-ghost">
            {copy.back}
          </Link>
          <button type="button" onClick={handleSignOut} className="btn-ghost text-red hover:border-red/35 hover:text-red">
            {copy.signOut}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSave} className="glass-card space-y-5 p-5 sm:p-6">
          <h2 className="text-2xl font-heading font-bold text-ink">{copy.profile}</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(copy.fields) as Array<keyof ProfileForm>).map((field) => (
              <label key={field} className={field === "delivery_notes" ? "block sm:col-span-2" : "block"}>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  {copy.fields[field]}
                </span>
                {field === "delivery_notes" ? (
                  <textarea
                    value={profile[field]}
                    onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))}
                    rows={4}
                    className="focus-ring w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink"
                  />
                ) : (
                  <input
                    value={profile[field]}
                    onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))}
                    className="focus-ring w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink"
                    type={field === "email" ? "email" : field === "phone" || field === "whatsapp" ? "tel" : "text"}
                    autoComplete={field === "email" ? "email" : field === "full_name" ? "name" : undefined}
                  />
                )}
              </label>
            ))}
          </div>

          {error ? (
            <p className="rounded-2xl border border-red/20 bg-red/10 px-4 py-3 text-sm font-semibold text-red">{error}</p>
          ) : null}
          {message ? (
            <p className="rounded-2xl border border-green/20 bg-green/10 px-4 py-3 text-sm font-semibold text-green">
              {message}
            </p>
          ) : null}

          <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60 sm:w-auto">
            {saving ? copy.saving : copy.save}
          </button>
        </form>

        <aside className="glass-card flex flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-heading font-bold text-ink">{copy.orders}</h2>
            {orders.length > 0 && (
              <span className="text-xs font-semibold text-muted">{orders.length} pedidos</span>
            )}
          </div>

          {orders.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-line bg-white px-4 py-6 text-center text-sm text-muted">
              {copy.emptyOrders}
            </p>
          ) : (
            <div className="mt-4 max-h-[520px] overflow-y-auto space-y-3 pr-1">
              {orders.map((order) => {
                const items = parseOrderItems(order);
                const extraCount = items.length > 2 ? items.length - 2 : 0;
                return (
                  <article key={order.id} className="rounded-2xl border border-line bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">
                          {order.order_number}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {new Date(order.created_at).toLocaleDateString(locale === "en" ? "en-US" : "es-DO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status, locale)}
                      </span>
                    </div>

                    <ul className="mt-2 space-y-0.5">
                      {items.slice(0, 2).map((item, index) => (
                        <li key={`${order.id}-${item.slug ?? item.title}-${index}`} className="text-xs text-muted">
                          {item.qty}x {item.title}
                        </li>
                      ))}
                      {extraCount > 0 && (
                        <li className="text-xs font-semibold text-muted">
                          +{extraCount} {isEn ? "more" : "más"}
                        </li>
                      )}
                    </ul>

                    <p className="mt-2 text-sm font-heading font-bold text-ink">
                      {formatCurrency(Number(order.total_amount), order.currency, locale)}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
