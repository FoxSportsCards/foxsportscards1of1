import groq from "groq";
import { getSanityClient, isSanityConfigured } from "@/lib/sanity.client";
import type { HomeDrop, Testimonial } from "@/types/home";

type HomeDropDocument = {
  _id: string;
  title: string;
  scheduledAt: string;
  statusLabel: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  showInBanner?: boolean;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  bannerMessage?: string;
  bannerCtaLabel?: string;
  bannerAction?: "agenda" | "cta" | "custom";
  bannerHref?: string;
};

type TestimonialDocument = {
  _id: string;
  quote: string;
  author: string;
  location?: string;
};

const HOME_DROPS_QUERY = groq`*[_type == "homeDrop"] | order(scheduledAt asc) {
  _id,
  title,
  scheduledAt,
  statusLabel,
  description,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  showInBanner,
  bannerMessage,
  bannerCtaLabel,
  bannerAction,
  bannerHref
}`;

const TESTIMONIALS_QUERY = groq`*[_type == "testimonial"] | order(coalesce(order, 9999) asc, _createdAt desc) {
  _id,
  quote,
  author,
  location
}`;

const FALLBACK_DROPS: HomeDrop[] = [
  {
    id: "fallback-drop-1",
    title: "Drop Vintage Hall of Fame",
    description: "Selección de piezas slabbed de los 80s-90s más rarezas Dominican Legends.",
    statusLabel: "Preventa abierta",
    scheduledAt: "2025-10-22T00:00:00.000Z",
    ctaLabel: "Apartar cupo",
    ctaHref: "https://wa.me/18492617328",
    showInBanner: true,
    bannerMessage: "29 OCT • Preventa abierta • Drop Vintage Hall of Fame",
    bannerCtaLabel: "Reservar cupo",
    bannerAction: "cta",
  },
  {
    id: "fallback-drop-2",
    title: "Sealed Night: NBA & MLB Boxes",
    description: "Box breaks privados con cupos limitados. Incluye guía de inversión y envío express.",
    statusLabel: "Reserva tu slot",
    scheduledAt: "2025-10-28T00:00:00.000Z",
    ctaLabel: "Ver agenda",
    ctaHref: "#agenda-drops",
    showInBanner: false,
    secondaryCtaLabel: "Hablar con concierge",
    secondaryCtaHref: "https://wa.me/18492617328",
  },
  {
    id: "fallback-drop-3",
    title: "TCG Crown Zenith Showcase",
    description: "Singles gem mint y packs sellados. Bonus: live grading coaching durante el drop.",
    statusLabel: "Lista de espera",
    scheduledAt: "2025-11-04T00:00:00.000Z",
    ctaLabel: "Únete a la lista",
    ctaHref: "https://wa.me/18492617328",
    showInBanner: false,
  },
];

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: "fallback-testimonial-1",
    quote:
      "El servicio concierge es otro nivel. Recibí asesoría para armar un set NBA 1/25 y cada pieza llegó perfectamente protegida.",
    author: "Luis G.",
    location: "Santo Domingo",
  },
  {
    id: "fallback-testimonial-2",
    quote:
      "Compré memorabilia firmada y el acompañamiento fue total: certificación, shipping y seguimiento hasta mi vitrina.",
    author: "María R.",
    location: "Puerto Rico",
  },
  {
    id: "fallback-testimonial-3",
    quote:
      "Sus drops privados son clave para encontrar grails antes de que lleguen al mercado abierto. Confianza garantizada.",
    author: "Carlos T.",
    location: "Miami",
  },
];

let warned = false;
function warnAboutFallbackUsage() {
  if (!warned) {
    console.warn("[sanity] Home content: usando datos locales de respaldo.");
    warned = true;
  }
}

function mapHomeDrop(doc: HomeDropDocument): HomeDrop {
  return {
    id: doc._id,
    title: doc.title,
    scheduledAt: doc.scheduledAt,
    statusLabel: doc.statusLabel,
    description: doc.description,
    ctaLabel: doc.ctaLabel ?? null,
    ctaHref: doc.ctaHref ?? null,
    showInBanner: Boolean(doc.showInBanner),
    secondaryCtaLabel: doc.secondaryCtaLabel ?? null,
    secondaryCtaHref: doc.secondaryCtaHref ?? null,
    bannerMessage: doc.bannerMessage ?? null,
    bannerCtaLabel: doc.bannerCtaLabel ?? null,
    bannerAction: doc.bannerAction ?? null,
    bannerHref: doc.bannerHref ?? null,
  };
}

function mapTestimonial(doc: TestimonialDocument): Testimonial {
  return {
    id: doc._id,
    quote: doc.quote,
    author: doc.author,
    location: doc.location ?? null,
  };
}

export async function getHomepageContent(): Promise<{
  drops: HomeDrop[];
  testimonials: Testimonial[];
}> {
  if (!isSanityConfigured) {
    warnAboutFallbackUsage();
    return {
      drops: FALLBACK_DROPS,
      testimonials: FALLBACK_TESTIMONIALS,
    };
  }

  const [drops, testimonials] = await Promise.all([
    getSanityClient().fetch<HomeDropDocument[]>(HOME_DROPS_QUERY),
    getSanityClient().fetch<TestimonialDocument[]>(TESTIMONIALS_QUERY),
  ]);

  return {
    drops: drops.map(mapHomeDrop),
    testimonials: testimonials.map(mapTestimonial),
  };
}
