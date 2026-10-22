import type { Metadata } from "next";
import { EnquiryBanner } from "@/components/home/EnquiryBanner";
import { FounderTimeline } from "@/components/home/FounderTimeline";
import { InfrastructureGallery } from "@/components/home/InfrastructureGallery";
import { Snapshot } from "@/components/home/Snapshot";
import { Container } from "@/components/ui/Container";
import { ArrowIcon } from "@/components/ui/icons";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Download } from "@/content/types";
import { getBrochure, getCertificates, getGallery, getSettings, getTimeline } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Founded in 2002 by Hemant Agrawal, Quality Steel and Metals imports, stocks, distributes and trades tool steel, die steel, plastic mould steel and special alloy steel.",
};

const sourcing = [
  {
    title: "Grades to recognised standards",
    body: "We supply steel to AISI, DIN and JIS designations, so you can order from the specification on your drawing.",
  },
  {
    title: "Equivalents matched",
    body: "A drawing may call for SKD61 while your supplier lists H13. We help you match equivalent grades across standards.",
  },
  {
    title: "Sourcing on request",
    body: "When a grade or size is not in stock, we source it and tell you plainly what is possible.",
  },
];

export default async function AboutPage() {
  const certificates = await getCertificates();
  const brochure = await getBrochure();
  return (
    <>
      <PageHero
        title="Steel, supplied honestly since 2002."
        intro="Quality Steel and Metals is an importer, stockist, distributor and trader of tool steel, die steel, plastic mould steel and special alloy steel."
      />
      <FounderTimeline entries={await getTimeline()} />
      <Snapshot />

      <section aria-labelledby="sourcing" className="bg-surface py-24 text-ink lg:py-32">
        <Container>
          <Reveal>
            <SectionHeading tone="light" kicker="Sourcing expertise" title={<span id="sourcing">Knowing steel is the job.</span>} />
          </Reveal>
          <ul className="mt-14 grid gap-px bg-ink/12 md:grid-cols-3">
            {sourcing.map((s) => (
              <Reveal as="li" key={s.title} className="bg-surface p-8 lg:p-10">
                <span aria-hidden="true" className="mb-8 block h-1.5 w-8 bg-gold" />
                <h3 className="font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-neutral-600">{s.body}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <InfrastructureGallery items={await getGallery()} />

      {certificates.length > 0 && <FileList id="certificates" title="Certificates" files={certificates} />}
      {brochure && <FileList id="brochure" title="Company brochure" files={[brochure]} />}

      <EnquiryBanner whatsappUrl={buildWhatsAppUrl((await getSettings()).whatsapp)} />
    </>
  );
}

function FileList({ id, title, files }: { id: string; title: string; files: Download[] }) {
  return (
    <section aria-labelledby={id} className="border-t border-white/8 py-24">
      <Container>
        <h2 id={id} className="text-h3 font-semibold">
          {title}
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {files.map((f) => (
            <li key={f.href}>
              <a href={f.href} className="flex items-center justify-between border border-white/12 px-5 py-4 hover:border-gold">
                {f.title}
                <ArrowIcon className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
