import type { MetadataRoute } from "next";
import { indexablePaths, siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const priority = (p: string) => (p === "/" ? 1 : p.startsWith("/grades/") || p === "/products/" ? 0.8 : 0.6);
  return (await indexablePaths()).map((p) => ({
    url: `${siteUrl()}${p}`,
    priority: priority(p),
  }));
}
