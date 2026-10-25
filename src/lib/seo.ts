// Page metadata with admin overrides, the list of public pages, and JSON-LD helpers.
import "server-only";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { CATALOG_TAG, getCategories, getPartners, getProducts, getServices } from "./content";
import { db } from "./server/db";

/** The site's public address, used for canonical links, the sitemap and structured data. */
// On Vercel, the project's production address is used until a domain is set in SITE_URL.
export const siteUrl = () =>
  (
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
  ).replace(/\/$/, "");

type SeoOverride = {
  title: string | null;
  description: string | null;
  noindex: boolean;
};

async function seoOverrides(): Promise<Record<string, SeoOverride>> {
  "use cache";
  cacheLife("max");
  cacheTag(CATALOG_TAG);
  const rows = await db.seoEntry.findMany();
  return Object.fromEntries(rows.map((r) => [r.path, { title: r.title, description: r.description, noindex: r.noindex }]));
}

export async function pageMetadata(path: string, defaults: { title: string; description: string }): Promise<Metadata> {
  const o = (await seoOverrides())[path];
  const title = o?.title || defaults.title;
  const description = o?.description || defaults.description;
  return {
    title,
    description,
    alternates: { canonical: path },
    // Page-level openGraph replaces the layout's, so repeat the site-wide fields here.
    openGraph: { title, description, url: path, type: "website", siteName: "Quality Steel and Metals", locale: "en_IN", images: ["/opengraph-image"] },
    ...(o?.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Every public page, for the sitemap and the SEO editor. */
export async function publicPaths(): Promise<string[]> {
  const [categories, products, services, partners] = await Promise.all([getCategories(), getProducts(), getServices(), getPartners()]);
  return [
    "/",
    "/about/",
    "/products/",
    ...categories.map((c) => `/products/${c.slug}/`),
    ...products.map((p) => `/grades/${p.slug}/`),
    "/services/",
    ...services.map((s) => `/services/${s.slug}/`),
    "/weight-calculator/",
    ...(partners.length > 0 ? ["/clients-partners/"] : []),
    "/contact/",
    "/quote/",
  ];
}

export async function indexablePaths() {
  const overrides = await seoOverrides();
  return (await publicPaths()).filter((p) => !overrides[p]?.noindex);
}

/** Safe to drop into <script type="application/ld+json">: no "</script>" can appear. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

/** schema.org BreadcrumbList, matching the visible breadcrumb trail. */
export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${siteUrl()}${t.path}`,
    })),
  };
}

/** schema.org Organization for the home page. Only facts the owner confirmed. */
export function organizationLd(s: { companyName: string; phone: string; email: string; officeAddress: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.companyName,
    url: `${siteUrl()}/`,
    logo: `${siteUrl()}/icon.svg`,
    foundingDate: "2002",
    founder: { "@type": "Person", name: "Hemant Bansal" },
    description: "Importer, stockist, distributor and trader of tool steel, die steel, plastic mould steel and special alloy steel.",
    telephone: s.phone,
    email: s.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.officeAddress,
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: s.phone,
      email: s.email,
      contactType: "sales",
    },
  };
}
