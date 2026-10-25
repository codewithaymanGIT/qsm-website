import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
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
import { getBrochure, getCertificates, getGallery, getGroupCompanies, getSettings, getTimeline } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/about/", {
    title: "About Us",
    description:
      "Founded in 2002 by Hemant Bansal, Quality Steel and Metals imports, stocks, distributes and trades tool steel, die steel, plastic mould steel and special alloy steel.",
  });
}

const sourcing = [
  {
    title: "Mills we import from",
    body: "Tier-1 and established mills in China, Taiwan, Germany, Japan, Italy and Austria, alongside Indian mills, so we can match the grade to your budget and application.",
  },
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
  const group = await getGroupCompanies();
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
          <ul className="mt-14 grid gap-px bg-ink/12 md:grid-cols-2">
            {sourcing.map((s) => (
              <Reveal as="li" key={s.title} className="bg-surface p-8 lg:p-10">
                <span aria-hidden="true" className="mb-8 block h-1.5 w-8 bg-accent" />
                <h3 className="font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">{s.body}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {group.length > 0 && (
        <section aria-labelledby="group" className="py-24 lg:py-32">
          <Container>
            <Reveal>
              <SectionHeading kicker="Our group" title={<span id="group">Part of a wider steel group.</span>} />
            </Reveal>
            <ul className="mt-14 grid gap-5 md:grid-cols-2">
              {group.map((g) => (
                <Reveal as="li" key={g.name} className="border border-white/10 bg-graphite p-8 lg:p-10">
                  <p className="text-sm font-medium text-accent">{g.role}</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold">{g.name}</h3>
                  <p className="mt-3 leading-relaxed text-mist">{g.location}</p>
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      )}

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
              <a href={f.href} className="flex items-center justify-between border border-white/12 px-5 py-4 hover:border-accent">
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
