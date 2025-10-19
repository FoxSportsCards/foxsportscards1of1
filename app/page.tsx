import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/pricing";
import { getAllProducts } from "@/lib/products";

export const revalidate = 60;

const stats = [
  { label: "Piezas certificadas", value: "120+" },
  { label: "Graded 9.5 o más", value: "85%" },
  { label: "Envíos asegurados", value: "RD & Intl" },
];

const collections = [
  {
    title: "NBA Grails",
    description: "Rookies serializados, autos on-card y parallels SSP listos para grading o vault.",
    metric: "Top players: Luka • Wemby • MJ",
    href: "/catalogo?deporte=nba",
  },
  {
    title: "TCG Masterpieces",
    description: "Charizard, Lugia y piezas exclusivas PSA 10/ BGS 9.5 con historial transparente.",
    metric: "Lotes curados · Sello original",
    href: "/catalogo?tipo=tcg",
  },
  {
    title: "Memorabilia Firmada",
    description: "Jerseys limited, balones certificados y fotos autografiadas con hologramas oficiales.",
    metric: "COA · Fanatics · Beckett",
    href: "/catalogo?tipo=memorabilia",
  },
];

const drops = [
  {
    date: "22 OCT",
    title: "Drop Vintage Hall of Fame",
    description: "Selección de piezas slabbed de los 80s-90s más rarezas Dominican Legends.",
    status: "Preventa abierta",
  },
  {
    date: "28 OCT",
    title: "Sealed Night: NBA & MLB Boxes",
    description: "Box breaks privados con cupos limitados. Incluye guía de inversión y envío express.",
    status: "Reserva tu slot",
  },
  {
    date: "04 NOV",
    title: "TCG Crown Zenith Showcase",
    description: "Singles gem mint y packs sellados. Bonus: live grading coaching durante el drop.",
    status: "Lista de espera",
  },
];

const testimonials = [
  {
    quote:
      "El servicio concierge es otro nivel. Recibí asesoría para armar un set NBA 1/25 y cada pieza llegó perfectamente protegida.",
    author: "Luis G., Santo Domingo",
  },
  {
    quote:
      "Compré memorabilia firmada y el acompañamiento fue total: certificación, shipping y seguimiento hasta mi vitrina.",
    author: "María R., Puerto Rico",
  },
  {
    quote:
      "Sus drops privados son clave para encontrar grails antes de que lleguen al mercado abierto. Confianza garantizada.",
    author: "Carlos T., Miami",
  },
];

export default async function Page() {
  const products = await getAllProducts();
  const availableProducts = products.filter((product) => product.status !== "sold");
  const spotlight = availableProducts[0] ?? products[0] ?? null;
  const gallery = (spotlight ? availableProducts.slice(1) : availableProducts).slice(0, 8);

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="container relative grid gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            <span className="eyebrow">Vault curado • Ediciones limitadas</span>
            <h1 className="text-4xl font-heading font-semibold leading-tight text-white sm:text-5xl md:text-[56px]">
              Coleccionables premium, autenticidad garantizada.
            </h1>
            <p className="max-w-xl text-base text-muted sm:text-lg">
              Seleccionamos cartas deportivas, TCG y memorabilia certificada para coleccionistas que exigen piezas únicas.
              Accede a drops exclusivos, asesoría concierge y envíos asegurados en República Dominicana.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black shadow-glow transition hover:bg-accent-soft"
              >
                Ver catálogo completo
              </Link>
              <a
                href="https://www.instagram.com/foxsportscards1of1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-muted transition hover:border-white/40 hover:text-white"
              >
                Ver vitrina diaria
              </a>
            </div>
            <div className="grid gap-4 pt-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center shadow-soft backdrop-blur"
                >
                  <p className="text-2xl font-heading text-accent">{stat.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          {spotlight && (
            <Link
              href={`/producto/${spotlight.slug}`}
              className="group relative block overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-4 shadow-glass transition hover:border-white/20 hover:shadow-glow"
            >
              <div className="absolute -left-16 top-10 hidden h-32 w-32 rounded-full bg-accent-secondary/30 blur-3xl md:block" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={spotlight.images[0]?.url ?? "/hero.jpg"}
                    alt={spotlight.images[0]?.alt ?? spotlight.title}
                    fill
                    sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 45vw, 80vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white">
                    Spotlight
                  </span>
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                      {spotlight.sport ?? spotlight.productType ?? "Coleccionable"}
                    </p>
                    <p className="text-xs text-muted">
                      {spotlight.year ? `Edición ${spotlight.year}` : spotlight.rarity ?? ""}
                    </p>
                  </div>
                  <h2 className="text-xl font-heading text-white">{spotlight.title}</h2>
                  <div className="flex items-center justify-between text-sm font-semibold text-accent">
                    <span>{formatCurrency(spotlight.price, spotlight.currency)}</span>
                    <span className="text-xs uppercase tracking-[0.35em] text-muted">
                      {spotlight.status === "upcoming" ? "Próximo drop" : "Disponible"}
                    </span>
                  </div>
                  <p className="text-sm text-muted">
                    {spotlight.shortDescription ?? "Pieza verificada. Incluye concierge y envío asegurado."}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-6 left-1/2 hidden h-24 w-32 -translate-x-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />
            </Link>
          )}
        </div>
      </section>

      <section className="relative py-16">
        <div className="container space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Selección semanal</span>
              <h2 className="mt-3 text-3xl font-heading font-semibold text-white">Nuevas llegadas al vault</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Singles de alto impacto, cajas selladas y memorabilia lista para tu vitrina. Actualizamos el catálogo cada
                semana con piezas verificadas y grading premium.
              </p>
            </div>
            <Link
              href="/lanzamientos"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-white/40 hover:text-white"
            >
              Ver calendario de drops
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gallery.map((product) => {
              const cover = product.images[0]?.url ?? "/hero.jpg";
              const alt = product.images[0]?.alt ?? product.title;
              const status = product.status ?? "available";

              return (
                <Link
                  key={product.slug}
                  href={`/producto/${product.slug}`}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-soft transition hover:-translate-y-1 hover:border-white/20 hover:shadow-glow"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={cover}
                      alt={alt}
                      fill
                      sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 35vw, 80vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {status !== "available" && (
                      <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white">
                        {status === "reserved" ? "Reservado" : status === "sold" ? "Vendido" : "Próximo"}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                      <span>{product.sport ?? product.productType ?? "Coleccionable"}</span>
                      {product.year && <span>{product.year}</span>}
                    </div>
                    <h3 className="line-clamp-2 text-sm font-medium text-white/90">{product.title}</h3>
                    <div className="flex items-center justify-between text-sm font-semibold text-accent">
                      <span>{formatCurrency(product.price, product.currency)}</span>
                      {product.rarity && <span className="text-xs text-muted">{product.rarity}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/5 bg-surface/60 py-16 backdrop-blur">
        <div className="container space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <span className="eyebrow">Colecciones curadas</span>
              <h2 className="text-3xl font-heading font-semibold text-white">Tres caminos para elevar tu vitrina</h2>
              <p className="max-w-2xl text-sm text-muted">
                Seleccionamos lotes por deporte y formato para que encuentres tu próxima pieza gem mint o ese grail que lleva
                meses en tu radar.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.title}
                href={collection.href}
                className="group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-soft transition hover:border-white/20 hover:shadow-glow"
              >
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-[0.3em] text-muted">Colección</span>
                  <h3 className="text-2xl font-heading text-white group-hover:text-accent">{collection.title}</h3>
                  <p className="text-sm text-muted">{collection.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                  <span>{collection.metric}</span>
                  <span className="text-accent">Explorar →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="container space-y-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="eyebrow">Calendario de drops</span>
              <h2 className="text-3xl font-heading font-semibold text-white">Agenda tus próximos movimientos</h2>
              <p className="max-w-2xl text-sm text-muted">
                Drops privados, breaks boutique y showcases virtuales. Los cupos son limitados y cada fecha incluye concierge en vivo.
              </p>
            </div>
            <a
              href="https://wa.me/18290000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-glow transition hover:bg-accent-soft"
            >
              Reservar cupo
            </a>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {drops.map((drop) => (
              <div key={drop.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
                <span className="text-xs uppercase tracking-[0.35em] text-muted">{drop.date}</span>
                <h3 className="mt-4 text-xl font-heading text-white">{drop.title}</h3>
                <p className="mt-3 text-sm text-muted">{drop.description}</p>
                <p className="mt-6 text-xs uppercase tracking-[0.3em] text-accent">{drop.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/5 bg-surface/60 py-16">
        <div className="container space-y-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="space-y-5">
              <span className="eyebrow">Nuestra historia</span>
              <h2 className="text-3xl font-heading font-semibold text-white">De la pasión por el deporte al vault premium.</h2>
              <p className="text-sm text-muted">
                foxsportscards1of1 nace de anos coleccionando, viajando a shows internacionales y construyendo relaciones con dealers,
                breakers y empresas de grading. Curamos cada pieza con criterios de inversión y storytelling para que cada compra
                sea una experiencia memorable.
              </p>
              <p className="text-sm text-muted">
                Ofrecemos concierge personalizado, autenticación, logística de envío y guías para potenciar tus colecciones a largo
                plazo. Creamos comunidad a través de drops privados, workshops y contenido educativo.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sobre"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-white/40 hover:text-white"
                >
                  Conoce el equipo →
                </Link>
                <Link
                  href="/preguntas"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-white/40 hover:text-white"
                >
                  FAQ & logística →
                </Link>
              </div>
            </div>
            <div className="grid gap-4 rounded-4xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-soft">
              <h3 className="text-sm uppercase tracking-[0.3em] text-muted">Concierge en números</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-background/70 p-5">
                  <p className="text-3xl font-heading text-accent">300+</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">Clientes atendidos</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-background/70 p-5">
                  <p className="text-3xl font-heading text-accent">48h</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">Promedio de entrega</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-background/70 p-5">
                  <p className="text-3xl font-heading text-accent">95%</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">Retención de clientes</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-background/70 p-5">
                  <p className="text-3xl font-heading text-accent">24/7</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">Soporte WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="container space-y-10">
          <div className="space-y-3 text-center">
            <span className="eyebrow mx-auto">Testimonios concierge</span>
            <h2 className="text-3xl font-heading font-semibold text-white">Lo que dicen nuestros coleccionistas</h2>
            <p className="mx-auto max-w-2xl text-sm text-muted">
              Construimos relaciones de largo plazo. Cada entrega va acompañada de transparencia, asesoría y seguimiento personalizado.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-muted shadow-soft"
              >
                <p>“{testimonial.quote}”</p>
                <p className="mt-6 text-xs uppercase tracking-[0.3em] text-accent">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
