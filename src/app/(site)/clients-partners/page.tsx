import type { Metadata } from "next";
import { PartnersView } from "@/components/partners/PartnersView";
import { getPartners } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

// Hidden from menus and search engines until at least one customer is listed.
export async function generateMetadata(): Promise<Metadata> {
  const empty = (await getPartners()).length === 0;
  const meta = await pageMetadata("/clients-partners/", {
    title: "Clients",
    description: "Companies Quality Steel and Metals has supplied with tool steel, die steel and processing.",
  });
  return empty ? { ...meta, robots: { index: false, follow: false } } : meta;
}

export default async function ClientsPage() {
  return <PartnersView partners={await getPartners()} />;
}
