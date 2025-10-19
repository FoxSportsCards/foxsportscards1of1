import Link from "next/link";

const quickLinks = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Lanzamientos", href: "/lanzamientos" },
  { label: "Historias", href: "/sobre" },
  { label: "Preguntas frecuentes", href: "/preguntas" },
];

const policyLinks = [
  { label: "Condiciones de compra", href: "/condiciones" },
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Contacto", href: "/contacto" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-white/10 bg-background/80">
      <div className="container py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-4">
            <h2 className="text-3xl font-heading font-semibold">Colecciona con confianza.</h2>
            <p className="text-sm text-muted">
              Vault curado, piezas verificadas y asesoría personalizada para cada adquisición. Construyamos juntos la
              vitrina que represente tu historia.
            </p>
          </div>
          <a
            href="https://wa.me/18290000000"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black shadow-glow transition hover:bg-accent-soft"
          >
            Agenda tu sesión concierge
          </a>
        </div>

        <div className="mt-12 grid gap-10 border-t border-white/5 pt-12 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-heading font-semibold">
              <span className="text-accent">fox</span>sportscards1of1
            </Link>
            <p className="text-sm text-muted">
              Curamos colecciones premium de deportes, TCG y memorabilia certificada para coleccionistas que exigen lo mejor.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.25em] text-muted">Explora</h3>
            <ul className="space-y-2 text-sm text-muted">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.25em] text-muted">Soporte</h3>
            <ul className="space-y-2 text-sm text-muted">
              {policyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] text-muted">Contacto directo</h3>
            <div className="space-y-2 text-sm text-muted">
              <a href="mailto:hola@foxsportscards1of1.com" className="transition hover:text-white">
                hola@foxsportscards1of1.com
              </a>
              <p>WhatsApp: +1 829 000 0000</p>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/5 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {currentYear} foxsportscards1of1. Todos los derechos reservados.</p>
          <p className="text-muted">
            Operamos desde República Dominicana con envíos asegurados a todo el país.
          </p>
        </div>
      </div>
    </footer>
  );
}
