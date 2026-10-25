// The only way pages read content. Results are cached and tagged "catalog";
// admin edits call revalidateTag(CATALOG_TAG) so pages refresh immediately.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import type {
  Category,
  CompositionRow,
  Download,
  GalleryItem,
  GroupCompany,
  PartnerLogo,
  Product,
  Service,
  Settings,
  TimelineEntry,
} from "@/content/types";
import { mediaHref } from "./media-href";
import { db } from "./server/db";

export const CATALOG_TAG = "catalog";

function cacheCatalog() {
  cacheLife("max");
  cacheTag(CATALOG_TAG);
}

const fileHref = mediaHref;

const productInclude = {
  category: { select: { slug: true } },
  downloads: { where: { published: true }, orderBy: { createdAt: "asc" } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toProduct(p: ProductRow): Product {
  const downloads = (kind: string): Download[] =>
    p.downloads.filter((d) => d.kind === kind).map((d) => ({ title: d.title, href: fileHref(d.fileKey) }));
  return {
    slug: p.slug,
    name: p.name,
    categorySlug: p.category.slug,
    tagline: p.tagline,
    equivalents: p.equivalents,
    overview: p.overview,
    applications: p.applications,
    industries: p.industries,
    composition: p.composition as CompositionRow[],
    mechanical: p.mechanical as Product["mechanical"],
    heatTreatment: p.heatTreatment as Product["heatTreatment"],
    hardness: p.hardness,
    forms: p.forms,
    datasheets: downloads("DATASHEET"),
    certificates: downloads("MATERIAL_CERTIFICATE"),
  };
}

const toCategory = (c: { slug: string; name: string; shortDescription: string; order: number; imageKey: string | null }): Category => ({
  slug: c.slug,
  name: c.name,
  shortDescription: c.shortDescription,
  order: c.order,
  image: c.imageKey ? fileHref(c.imageKey) : null,
});

const toService = (s: { slug: string; name: string; summary: string; description: string[]; capabilities: string[]; imageKeys: string[] }): Service => ({
  slug: s.slug,
  name: s.name,
  summary: s.summary,
  description: s.description,
  capabilities: s.capabilities,
  images: s.imageKeys.map(fileHref),
});

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheCatalog();
  return (await db.category.findMany({ orderBy: { order: "asc" } })).map(toCategory);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheCatalog();
  const rows = await db.product.findMany({
    where: { published: true },
    include: productInclude,
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return rows.map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.categorySlug === slug);
}

/** Same category first, then others. */
export async function getRelatedProducts(slug: string, limit = 3): Promise<Product[]> {
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) return [];
  const others = products.filter((p) => p.slug !== slug);
  const sameCategory = others.filter((p) => p.categorySlug === product.categorySlug);
  const rest = others.filter((p) => p.categorySlug !== product.categorySlug);
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheCatalog();
  return (await db.service.findMany({ where: { published: true }, orderBy: { order: "asc" } })).map(toService);
}

export async function getService(slug: string): Promise<Service | undefined> {
  return (await getServices()).find((s) => s.slug === slug);
}

export async function getGallery(): Promise<GalleryItem[]> {
  "use cache";
  cacheCatalog();
  const rows = await db.galleryItem.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  return rows.map((g) => ({ id: g.id, label: g.label, shot: g.shot, aspect: g.aspect as GalleryItem["aspect"], src: g.imageKey ? fileHref(g.imageKey) : null }));
}

export async function getPartners(): Promise<PartnerLogo[]> {
  "use cache";
  cacheCatalog();
  const rows = await db.partnerLogo.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  return rows.map((l) => ({ id: l.id, name: l.name, src: l.imageKey ? mediaHref(l.imageKey) : null }));
}

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  "use cache";
  cacheCatalog();
  const row = await db.setting.findUnique({ where: { key } });
  return (row?.value as T | undefined) ?? fallback;
}

export async function getGroupCompanies(): Promise<GroupCompany[]> {
  return getSetting<GroupCompany[]>("groupCompanies", []);
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  return getSetting<TimelineEntry[]>("timeline", []);
}

export async function getSettings(): Promise<Settings> {
  const s = await getSetting<Settings | null>("contact", null);
  if (!s) throw new Error('Missing "contact" setting. Run the database seed.');
  return s;
}

export async function getCertificates(): Promise<Download[]> {
  "use cache";
  cacheCatalog();
  const rows = await db.certificate.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  return rows.map((c) => ({ title: c.title, href: fileHref(c.fileKey) }));
}

export async function getBrochure(): Promise<Download | null> {
  "use cache";
  cacheCatalog();
  const row = await db.download.findFirst({ where: { kind: "BROCHURE", published: true }, orderBy: { createdAt: "desc" } });
  return row ? { title: row.title, href: fileHref(row.fileKey) } : null;
}
