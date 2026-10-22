import { CategoryCards } from "@/components/home/CategoryCards";
import { EnquiryBanner } from "@/components/home/EnquiryBanner";
import { FounderTimeline } from "@/components/home/FounderTimeline";
import { Hero } from "@/components/home/Hero";
import { InfrastructureGallery } from "@/components/home/InfrastructureGallery";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { Snapshot } from "@/components/home/Snapshot";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { getGallery, getSettings, getTimeline } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default async function Home() {
  const settings = await getSettings();
  return (
    <>
      <Hero videoSrc={settings.heroVideo} />
      <Snapshot />
      <CategoryCards />
      <WhyChooseUs />
      <ServicesPreview />
      <FounderTimeline entries={await getTimeline()} />
      <InfrastructureGallery items={await getGallery()} />
      <EnquiryBanner whatsappUrl={buildWhatsAppUrl(settings.whatsapp)} />
    </>
  );
}
