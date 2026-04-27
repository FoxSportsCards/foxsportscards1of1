import { getServerLocale } from "@/lib/getServerLocale";

export const runtime = "edge";

export default function UbicacionPage() {
  const locale = getServerLocale();
  const isEn = locale === "en";

  const mapsUrl =
    "https://www.google.com/maps/place/18%C2%B029'09.5%22N+69%C2%B050'53.9%22W/@18.48596,-69.848312,17z";

  return (
    <section className="container py-14 sm:py-16">
      <header className="mb-10 max-w-3xl space-y-3">
        <span className="eyebrow">{isEn ? "Visit us" : "Visítanos"}</span>
        <h1 className="text-4xl font-heading font-bold text-ink sm:text-5xl">
          {isEn ? "Our store location" : "Nuestra ubicación"}
        </h1>
        <p className="text-sm text-muted">
          {isEn
            ? "We're in Santo Domingo — come in, browse and pick up your cards in person."
            : "Estamos en Santo Domingo — entra, mira y llévate tus cartas en persona."}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Mapa */}
        <div className="overflow-hidden rounded-3xl border border-line shadow-soft" style={{ minHeight: 380 }}>
          <iframe
            title={isEn ? "Store location" : "Ubicación de la tienda"}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.8!2d-69.848312!3d18.48596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDI5JzA5LjUiTiA2OcKwNTAnNTMuOSJX!5e0!3m2!1ses!2sdo!4v1714000000000"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 380, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Detalles */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {isEn ? "Address" : "Dirección"}
            </p>
            <p className="mt-2 text-base font-heading font-bold text-ink">
              Liam Business Center
            </p>
            <p className="mt-0.5 text-sm text-muted">Alma Rosa, Santo Domingo Este</p>
            <p className="mt-0.5 text-sm text-muted">República Dominicana</p>
          </div>

          <div className="glass-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {isEn ? "Hours" : "Horario"}
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-ink">{isEn ? "Mon – Fri" : "Lun – Vie"}</span>
                <span className="text-muted">10:00 – 19:00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-ink">{isEn ? "Saturday" : "Sábado"}</span>
                <span className="text-muted">10:00 – 17:00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-ink">{isEn ? "Sunday" : "Domingo"}</span>
                <span className="text-muted">{isEn ? "Closed" : "Cerrado"}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">WhatsApp</p>
            <a
              href="https://wa.me/18492617328"
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-base font-heading font-bold text-green hover:opacity-75"
            >
              +1 (849) 261-7328
            </a>
            <p className="mt-0.5 text-xs text-muted">
              {isEn ? "Call ahead before visiting." : "Escríbenos antes de venir."}
            </p>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
              <path d="M10 2C6.686 2 4 4.686 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.314-2.686-6-6-6z" />
              <circle cx="10" cy="8" r="2" />
            </svg>
            {isEn ? "Open in Google Maps" : "Abrir en Google Maps"}
          </a>
        </div>
      </div>
    </section>
  );
}
