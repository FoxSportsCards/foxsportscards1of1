import Link from "next/link";

export const runtime = "edge";

export default function NotFound() {
  return (
    <section className="container py-16">
      <div className="glass-card mx-auto max-w-2xl p-8 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">404</p>
        <h1 className="mt-3 text-3xl font-heading font-bold text-ink sm:text-4xl">
          Esta página no existe
        </h1>
        <p className="mt-3 text-sm text-muted">Vuelve al inicio para seguir navegando la tienda.</p>
        <Link href="/" className="btn-primary mt-6">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
