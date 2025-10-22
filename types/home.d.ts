export type HomeDrop = {
  id: string;
  title: string;
  scheduledAt: string;
  statusLabel: string;
  description: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  showInBanner?: boolean;
  secondaryCtaLabel?: string | null;
  secondaryCtaHref?: string | null;
  bannerMessage?: string | null;
  bannerCtaLabel?: string | null;
  bannerAction?: "agenda" | "cta" | "custom" | null;
  bannerHref?: string | null;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  location?: string | null;
};
