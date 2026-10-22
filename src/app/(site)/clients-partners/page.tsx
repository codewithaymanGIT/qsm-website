import type { Metadata } from "next";
import { PartnersView } from "@/components/partners/PartnersView";
import { getPartners } from "@/lib/content";

// Hidden from menus and search engines until at least one customer is listed.
export async function generateMetadata(): Promise<Metadata> {
  const empty = (await getPartners()).length === 0;
  return {
    title: "Clients",
    description: "Companies Quality Steel and Metals has supplied with tool steel, die steel and processing.",
    robots: empty ? { index: false, follow: false } : undefined,
  };
}

export default async function ClientsPage() {
  return <PartnersView partners={await getPartners()} />;
}
