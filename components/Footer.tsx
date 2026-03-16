import Link from "next/link";
import type { Locale } from "@/lib/locale";

type FooterProps = {
  locale: Locale;
};

export default function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const copy =
    locale === "en"
      ? {
          eyebrow: "Online boutique",
          title: "Collect real pieces with confidence.",
          text: "Premium cards, signed jerseys and authenticated memorabilia for serious collectors.",
          buy: "Buy via WhatsApp",
          shop: "Shop",
          brand: "Brand",
          contact: "Direct contact",
          catalog: "Catalog",
          releases: "Releases",
          faq: "FAQ",
          about: "About",
          contactLink: "Contact",
          instagram: "Instagram",
          shipping: "Insured shipping in Dominican Republic.",
          signatureTitle: "Crafted by Planos Web",
          signatureText: "Web design & development",
        }
      : {
          eyebrow: "Boutique digital",
          title: "Colecciona piezas reales con confianza.",
          text: "Cartas premium, jerseys firmados y memorabilia autenticada para coleccionistas exigentes.",
          buy: "Comprar por WhatsApp",
          shop: "Tienda",
          brand: "Marca",
          contact: "Contacto directo",
          catalog: "Catálogo",
          releases: "Lanzamientos",
          faq: "FAQ",
          about: "Nosotros",
          contactLink: "Contacto",
          instagram: "Instagram",
          shipping: "Envíos asegurados en República Dominicana.",
          signatureTitle: "Sitio creado por Planos Web",
          signatureText: "Diseño y desarrollo web",
        };

  const shopLinks = [
    { label: copy.catalog, href: "/catalogo" },
    { label: copy.releases, href: "/lanzamientos" },
    { label: copy.faq, href: "/preguntas" },
  ];

  const brandLinks = [
    { label: copy.about, href: "/sobre" },
    { label: copy.contactLink, href: "/contacto" },
  ];

  return (
    <footer className="mt-20 border-t border-line/90 bg-white/70">
      <div className="container py-14">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-4">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="max-w-lg text-3xl font-heading font-bold text-ink">{copy.title}</h2>
            <p className="max-w-md text-sm text-muted">{copy.text}</p>
            <a href="https://wa.me/18492617328" target="_blank" rel="noreferrer" className="btn-primary">
              {copy.buy}
            </a>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{copy.shop}</h3>
            <ul className="space-y-2 text-sm text-muted">
              {shopLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-blue">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{copy.brand}</h3>
            <ul className="space-y-2 text-sm text-muted">
              {brandLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-blue">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{copy.contact}</h3>
            <a href="mailto:hola@foxsportscards1of1.com" className="block text-sm text-muted hover:text-blue">
              hola@foxsportscards1of1.com
            </a>
            <p className="text-sm text-muted">+1 (849) 261-7328</p>
            <a
              href="https://www.instagram.com/foxsportscards1of1"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted hover:border-blue/35 hover:text-blue"
            >
              {copy.instagram}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white/85 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {copy.signatureTitle} | {copy.signatureText}
          </p>
          <a
            href="https://www.planosweb.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-blue hover:underline"
          >
            www.planosweb.com
          </a>
        </div>

        <div className="mt-8 border-t border-line pt-6 text-xs uppercase tracking-[0.16em] text-muted">
          <p>
            Fox Sports Cards 1of1 | {currentYear} | {copy.shipping}
          </p>
        </div>
      </div>
    </footer>
  );
}
