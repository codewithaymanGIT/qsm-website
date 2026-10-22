import { CategoryCards } from "@/components/home/CategoryCards";
import { EnquiryBanner } from "@/components/home/EnquiryBanner";
import { FounderTimeline } from "@/components/home/FounderTimeline";
import { Hero } from "@/components/home/Hero";
import { InfrastructureGallery } from "@/components/home/InfrastructureGallery";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { Snapshot } from "@/components/home/Snapshot";
import { TrustedBy } from "@/components/home/TrustedBy";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { getGallery, getSettings, getTimeline } from "@/lib/content";
import { organizationLd, pageMetadata } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await pageMetadata("/", {
    title: "Quality Steel and Metals | Tool Steel, Die Steel & Mould Steel Since 2002",
    description:
      "Importer, stockist, distributor and trader of tool steel, die steel, plastic mould steel and special alloy steel since 2002, with cutting, machining and grinding services.",
  });
  // The home title already names the company, so skip the "| Quality Steel and Metals" suffix.
  return { ...meta, title: { absolute: String(meta.title) } };
}

export default async function Home() {
  const settings = await getSettings();
  return (
    <>
      <JsonLd data={organizationLd(settings)} />
      <Hero videoSrc={settings.heroVideo} />
      <Snapshot />
      <TrustedBy />
      <CategoryCards />
      <WhyChooseUs />
      <ServicesPreview />
      <FounderTimeline entries={await getTimeline()} />
      <InfrastructureGallery items={await getGallery()} />
      <EnquiryBanner whatsappUrl={buildWhatsAppUrl(settings.whatsapp)} />
    </>
  );
}
