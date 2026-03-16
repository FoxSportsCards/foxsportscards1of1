import { getServerLocale } from "@/lib/getServerLocale";

export default function AboutPage() {
  const locale = getServerLocale();
  const isEn = locale === "en";

  const values = isEn
    ? [
        {
          title: "Real curation",
          text: "We do not upload volume for the sake of volume. Every piece is selected for demand and traceability.",
        },
        {
          title: "Transparency",
          text: "Availability, price and buying channel are visible from the first glance.",
        },
        {
          title: "Boutique service",
          text: "Direct support for one-off purchases or long-term collection building.",
        },
      ]
    : [
        {
          title: "Curacion real",
          text: "No subimos volumen por subir. Seleccionamos piezas con demanda y trazabilidad clara.",
        },
        {
          title: "Transparencia",
          text: "Disponibilidad, precio y canal de compra visibles desde la primera vista.",
        },
        {
          title: "Servicio boutique",
          text: "Acompanamiento uno a uno para compras puntuales o construccion de coleccion.",
        },
      ];

  return (
    <section className="container py-14 sm:py-16">
      <div className="max-w-3xl space-y-4">
        <span className="eyebrow">{isEn ? "About us" : "Sobre la marca"}</span>
        <h1 className="text-4xl font-heading font-bold text-ink sm:text-5xl">
          {isEn
            ? "Fox Sports Cards 1of1 was built to sell collectibles with clear standards."
            : "Fox Sports Cards 1of1 nace para vender coleccionables con criterio."}
        </h1>
        <p className="text-sm text-muted">
          {isEn
            ? "We are a digital boutique focused on sports cards, memorabilia and signed pieces. This storefront prioritizes product visibility, speed and direct checkout."
            : "Somos una boutique digital enfocada en cartas deportivas, memorabilia y piezas firmadas. Este rediseno prioriza visibilidad de producto, velocidad y compra directa."}
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {values.map((item, index) => (
          <article key={item.title} className="glass-card p-5">
            <p
              className={
                index === 0
                  ? "text-xs font-semibold uppercase tracking-[0.16em] text-blue"
                  : index === 1
                    ? "text-xs font-semibold uppercase tracking-[0.16em] text-green"
                    : "text-xs font-semibold uppercase tracking-[0.16em] text-red"
              }
            >
              {isEn ? "Pillar" : "Pilar"}
            </p>
            <h2 className="mt-2 text-2xl font-heading font-bold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

