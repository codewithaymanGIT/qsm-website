// Shapes mirror the Phase 2 database tables so the loaders in
// src/lib/content.ts can be swapped for Prisma queries without page changes.

export type Download = { title: string; href: string };

export type Category = {
  slug: string;
  name: string;
  shortDescription: string;
  order: number;
};

export type CompositionRow = {
  element: string;
  min?: number;
  max?: number;
};

export type Product = {
  slug: string;
  name: string;
  categorySlug: string;
  /** Short line under the grade name in the hero. */
  tagline: string;
  equivalents: string[];
  overview: string;
  applications: string[];
  industries: string[];
  composition: CompositionRow[];
  mechanical: { label: string; value: string }[];
  heatTreatment: { step: string; detail: string }[];
  hardness: string;
  forms: string[];
  datasheets: Download[];
  certificates: Download[];
};

export type Service = {
  slug: string;
  name: string;
  summary: string;
  description: string[];
  capabilities: string[];
};

export type GalleryItem = {
  id: string;
  label: string;
  aspect: "portrait" | "landscape" | "square";
  /** What the photographer should capture for this slot. */
  shot: string;
};

/** A customer shown on the site. Without a logo file, the name is shown as a badge. */
export type PartnerLogo = { id: string; name: string; src: string | null };

export type TimelineEntry = { year: string; title: string; body: string };

export type Settings = {
  companyName: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  email: string;
  officeAddress: string;
  mapEmbedUrl: string | null;
  heroVideo: string | null;
};
