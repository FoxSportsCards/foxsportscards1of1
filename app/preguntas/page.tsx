import { getServerLocale } from "@/lib/getServerLocale";

export default function FaqPage() {
  const locale = getServerLocale();
  const isEn = locale === "en";

  const faqItems = isEn
    ? [
        {
          question: "How do I confirm a purchase?",
          answer:
            "You can checkout through cart or WhatsApp. In both cases we confirm stock first and share payment steps.",
        },
        {
          question: "Do you ship in Dominican Republic?",
          answer: "Yes. We work with insured shipping and direct delivery coordination.",
        },
        {
          question: "Can I reserve an upcoming release?",
          answer: "Yes. Products marked as upcoming can be reserved through WhatsApp.",
        },
        {
          question: "Are pieces authentic?",
          answer:
            "We only list verified pieces and we include condition, certification and real product photos.",
        },
      ]
    : [
        {
          question: "Como confirmo una compra?",
          answer:
            "Puedes cerrar por carrito o por WhatsApp. En ambos casos confirmamos stock y te enviamos los pasos de pago.",
        },
        {
          question: "Hacen envios en Republica Dominicana?",
          answer: "Si. Trabajamos con envio asegurado y coordinacion directa hasta entrega.",
        },
        {
          question: "Puedo reservar un lanzamiento?",
          answer: "Si. Los productos marcados como proximos se pueden apartar por WhatsApp.",
        },
        {
          question: "Las piezas son autenticas?",
          answer:
            "Solo trabajamos con piezas verificadas y mostramos detalles de estado, certificacion y fotos reales del producto.",
        },
      ];

  return (
    <section className="container py-14 sm:py-16">
      <div className="max-w-3xl space-y-4">
        <span className="eyebrow">{isEn ? "Frequently asked questions" : "Preguntas frecuentes"}</span>
        <h1 className="text-4xl font-heading font-bold text-ink sm:text-5xl">
          {isEn ? "Everything you need before buying" : "Todo lo necesario para comprar con confianza"}
        </h1>
        <p className="text-sm text-muted">
          {isEn
            ? "If your question is not listed here, open WhatsApp and we answer quickly."
            : "Si no encuentras tu respuesta aqui, abre WhatsApp y te respondemos rapido."}
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        {faqItems.map((item, index) => (
          <article key={item.question} className="glass-card p-5">
            <p
              className={
                index % 3 === 0
                  ? "text-xs font-semibold uppercase tracking-[0.16em] text-blue"
                  : index % 3 === 1
                    ? "text-xs font-semibold uppercase tracking-[0.16em] text-green"
                    : "text-xs font-semibold uppercase tracking-[0.16em] text-red"
              }
            >
              FAQ
            </p>
            <h2 className="mt-2 text-xl font-heading font-bold text-ink">{item.question}</h2>
            <p className="mt-2 text-sm text-muted">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

