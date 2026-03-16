import { getServerLocale } from "@/lib/getServerLocale";

export default function ContactPage() {
  const locale = getServerLocale();
  const isEn = locale === "en";

  return (
    <section className="container py-14 sm:py-16">
      <div className="max-w-3xl space-y-4">
        <span className="eyebrow">{isEn ? "Sales contact" : "Contacto de ventas"}</span>
        <h1 className="text-4xl font-heading font-bold text-ink sm:text-5xl">
          {isEn ? "Let us help with your next pickup" : "Hablemos de tu proxima compra"}
        </h1>
        <p className="text-sm text-muted">
          {isEn
            ? "We answer stock questions, reserves and special orders quickly during the day."
            : "Atendemos consultas de stock, reservas y compras especiales con respuesta rapida durante el dia."}
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <a
          href="https://wa.me/18492617328"
          target="_blank"
          rel="noreferrer"
          className="glass-card p-5 hover:border-green/35"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green">WhatsApp</p>
          <p className="mt-2 text-xl font-heading font-bold text-ink">+1 (849) 261-7328</p>
          <p className="mt-2 text-sm text-muted">
            {isEn ? "Main channel to buy or reserve." : "Canal principal para comprar o reservar."}
          </p>
        </a>

        <a
          href="https://www.instagram.com/foxsportscards1of1"
          target="_blank"
          rel="noreferrer"
          className="glass-card p-5 hover:border-blue/35"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">Instagram</p>
          <p className="mt-2 text-xl font-heading font-bold text-ink">@foxsportscards1of1</p>
          <p className="mt-2 text-sm text-muted">
            {isEn ? "Daily showcase with new pieces." : "Vitrina diaria con nuevas piezas."}
          </p>
        </a>

        <a href="mailto:hola@foxsportscards1of1.com" className="glass-card p-5 hover:border-red/35">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red">Email</p>
          <p className="mt-2 text-xl font-heading font-bold text-ink">hola@foxsportscards1of1.com</p>
          <p className="mt-2 text-sm text-muted">
            {isEn
              ? "Support for private or business purchases."
              : "Soporte para compras empresariales o privadas."}
          </p>
        </a>
      </div>
    </section>
  );
}

