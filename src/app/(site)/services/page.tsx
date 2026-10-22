import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryBanner } from "@/components/home/EnquiryBanner";
import { Container } from "@/components/ui/Container";
import { ArrowIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { getServices, getSettings } from "@/lib/content";
import { serviceShots } from "@/lib/service-shots";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Processing Services",
  description: "Bandsaw cutting, precision machining, surface grinding and custom cutting of tool and die steel to your size.",
};

export default async function ServicesPage() {
  return (
    <>
      <PageHero title="Cut, machined and ground to size." intro="Buy the size you need. We process material before dispatch so it reaches your toolroom ready for the next operation." />
      <section className="py-20 lg:py-28">
        <Container>
          <ul className="grid gap-16 lg:gap-24">
            {(await getServices()).map((s, i) => (
              <Reveal as="li" key={s.slug}>
                <Link href={`/services/${s.slug}/`} className="group grid items-center gap-8 md:grid-cols-2 md:gap-14">
                  <div className={`relative aspect-[4/3] overflow-hidden ${i % 2 ? "md:order-2" : ""}`}>
                    <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]">
                      <ImageSlot label={s.name} shot={serviceShots[s.slug]} className="h-full w-full" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-h2 font-semibold transition-colors group-hover:text-accent">{s.name}</h2>
                    <p className="mt-5 max-w-lg text-lg leading-relaxed text-mist">{s.summary}</p>
                    <span className="mt-8 inline-flex items-center gap-2 text-accent">
                      View service <ArrowIcon className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
      <EnquiryBanner whatsappUrl={buildWhatsAppUrl((await getSettings()).whatsapp)} />
    </>
  );
}
