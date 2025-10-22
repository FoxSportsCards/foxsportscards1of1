export type HomeDrop = {
  id: string;
  title: string;
  scheduledAt: string;
  statusLabel: string;
  description: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  showInBanner?: boolean;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  location?: string | null;
};
