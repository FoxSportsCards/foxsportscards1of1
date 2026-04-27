"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/locale";

type LoginClientProps = {
  locale?: Locale;
};

type Mode = "signin" | "signup";

export default function LoginClient({ locale = "es" }: LoginClientProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEn = locale === "en";
  const copy = isEn
    ? {
        eyebrow: "Customer access",
        title: "Sign in to save delivery details",
        text: "Use your account to reuse address, phone and order history when placing an order.",
        signin: "Sign in",
        signup: "Create account",
        fullName: "Full name",
        email: "Email",
        password: "Password",
        google: "Continue with Google",
        submitSignin: "Sign in",
        submitSignup: "Create account",
        loading: "Working...",
        notConfigured: "Customer access is temporarily unavailable. Please try again later.",
        checkEmail: "Account created. Check your email if confirmation is required.",
        back: "Back to catalog",
      }
    : {
        eyebrow: "Acceso de cliente",
        title: "Inicia sesión para guardar tus datos de entrega",
        text: "Tu cuenta guarda dirección, celular e historial de pedidos para comprar más rápido.",
        signin: "Iniciar sesión",
        signup: "Crear cuenta",
        fullName: "Nombre completo",
        email: "Correo",
        password: "Contraseña",
        google: "Continuar con Google",
        submitSignin: "Iniciar sesión",
        submitSignup: "Crear cuenta",
        loading: "Procesando...",
        notConfigured: "El acceso de clientes no está disponible temporalmente. Inténtalo más tarde.",
        checkEmail: "Cuenta creada. Revisa tu correo si se requiere confirmación.",
        back: "Volver al catálogo",
      };

  const authError =
    mode === "signup"
      ? isEn
        ? "We could not create the account. Check the information and try again."
        : "No pudimos crear la cuenta. Revisa los datos e intenta de nuevo."
      : isEn
        ? "We could not sign you in. Check your email and password."
        : "No pudimos iniciar sesión. Revisa tu correo y contraseña.";

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setError(copy.notConfigured);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(authError);
      setLoading(false);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage(copy.checkEmail);
      setLoading(false);
      return;
    }

    window.location.href = "/cuenta";
  };

  const handleGoogle = async () => {
    if (!supabase) {
      setError(copy.notConfigured);
      return;
    }
    setLoading(true);
    setError(null);
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/cuenta`,
      },
    });
    if (googleError) {
      setError(isEn ? "Google sign-in is unavailable right now." : "El acceso con Google no está disponible ahora mismo.");
      setLoading(false);
    }
  };

  return (
    <section className="container py-14 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-4">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="text-4xl font-heading font-bold text-ink sm:text-5xl">{copy.title}</h1>
          <p className="text-sm text-muted">{copy.text}</p>
          <Link href="/catalogo" className="btn-ghost">
            {copy.back}
          </Link>
        </div>

        <div className="glass-card p-5 sm:p-6">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-full border border-line bg-white p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={
                mode === "signin"
                  ? "rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-blue"
              }
            >
              {copy.signin}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={
                mode === "signup"
                  ? "rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-blue"
              }
            >
              {copy.signup}
            </button>
          </div>

          {!supabase ? (
            <p className="mb-4 rounded-2xl border border-red/20 bg-red/10 px-4 py-3 text-sm font-semibold text-red">
              {copy.notConfigured}
            </p>
          ) : null}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" ? (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  {copy.fullName}
                </span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="focus-ring w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink"
                  autoComplete="name"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {copy.email}
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="focus-ring w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink"
                required
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {copy.password}
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="focus-ring w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-red/20 bg-red/10 px-4 py-3 text-sm font-semibold text-red">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-2xl border border-green/20 bg-green/10 px-4 py-3 text-sm font-semibold text-green">
                {message}
              </p>
            ) : null}

            <button type="submit" disabled={loading || !supabase} className="btn-primary w-full disabled:opacity-60">
              {loading ? copy.loading : mode === "signup" ? copy.submitSignup : copy.submitSignin}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">OAuth</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || !supabase}
            className="focus-ring w-full rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-soft hover:border-blue/35 disabled:opacity-60"
          >
            {copy.google}
          </button>
        </div>
      </div>
    </section>
  );
}
