import type { Metadata } from "next";
import { CategoryCards } from "@/components/home/CategoryCards";
import { EnquiryBanner } from "@/components/home/EnquiryBanner";
import { PageHero } from "@/components/ui/PageHero";
import { getSettings } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Plastic mould steel, hot work and cold work tool steel, high speed steel, EN series, alloy steel and mould base plates. Browse grades and technical data.",
};

export default async function ProductsPage() {
  return (
    <>
      <PageHero
        title="Tool, die and mould steel."
        intro="Eight families of steel for toolrooms, mould makers and manufacturers. Open a category to see its grades, technical data and applications."
      />
      <div className="pt-16 lg:pt-20">
        <CategoryCards showHeading={false} homeLabelsOn={false} />
      </div>
      <EnquiryBanner whatsappUrl={buildWhatsAppUrl((await getSettings()).whatsapp)} />
    </>
  );
}
