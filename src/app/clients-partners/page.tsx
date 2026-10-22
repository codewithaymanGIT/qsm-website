import type { Metadata } from "next";
import { Suspense } from "react";
import { PartnersView } from "@/components/partners/PartnersView";
import { getPartners } from "@/lib/content";

// Hidden from menus, search engines and visitors until real logos exist.
// Static export cannot return a real 404 here; Phase 2 calls notFound() instead.
export async function generateMetadata(): Promise<Metadata> {
  const empty = (await getPartners()).length === 0;
  return {
    title: "Clients & Partners",
    description: "Companies Quality Steel and Metals supplies and works with.",
    robots: empty ? { index: false, follow: false } : undefined,
  };
}

export default async function ClientsPartnersPage() {
  return (
    <Suspense>
      <PartnersView partners={await getPartners()} />
    </Suspense>
  );
}
