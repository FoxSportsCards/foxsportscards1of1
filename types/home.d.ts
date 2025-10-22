export type HomeDrop = {
  id: string;
  title: string;
  scheduledAt: string;
  statusLabel: string;
  description: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  location?: string | null;
};

