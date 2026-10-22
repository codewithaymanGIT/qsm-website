import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Enquiry } from "@/components/forms/Enquiry";
import { GradeEnquiry } from "@/components/product/GradeEnquiry";
import { Container } from "@/components/ui/Container";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { getService, getServices, getSettings } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { serviceShots } from "@/lib/service-shots";

export const dynamicParams = false;

export function generateStaticParams() {
  return getServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = getService((await params).slug);
  return service ? { title: service.name, description: service.summary } : {};
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const whatsappUrl = buildWhatsAppUrl(getSettings().whatsapp);

  return (
    <>
      <PageHero title={service.name} intro={service.summary} crumbs={[{ href: "/services/", label: "Services" }]} />

      <section aria-label="Photos" className="pt-20 lg:pt-28">
        <Container className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <ImageSlot label={`${service.name} in progress`} shot={serviceShots[service.slug]} className="aspect-[4/3] md:aspect-auto md:min-h-[460px]" />
          <ImageSlot label="Finished material" shot={`Material after ${service.name.toLowerCase()}, ready for dispatch`} className="aspect-[4/3]" />
        </Container>
      </section>

      <section aria-labelledby="about-service" className="py-20 lg:py-28">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-24">
          <Reveal>
            <h2 id="about-service" className="mb-5 text-sm font-medium text-gold">
              About this service
            </h2>
            <div className="space-y-6">
              {service.description.map((p) => (
                <p key={p} className="font-display text-[clamp(1.35rem,2.2vw,2rem)] leading-snug font-medium tracking-[-0.01em]">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <h2 className="mb-5 text-sm font-medium text-gold">What we handle</h2>
            <ul className="border-t border-white/10">
              {service.capabilities.map((c) => (
                <li key={c} className="border-b border-white/10 py-4 text-lg">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <GradeEnquiry title={`Request ${service.name.toLowerCase()}`} whatsappUrl={whatsappUrl} quoteHref="/quote/">
        <Enquiry service={service.name} title="Send your requirement" />
      </GradeEnquiry>
    </>
  );
}
