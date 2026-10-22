import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getServices } from "@/lib/content";

const shots: Record<string, string> = {
  "bandsaw-cutting": "Bandsaw blade entering a round bar",
  "precision-machining": "Milling cutter squaring a block",
  "surface-grinding": "Grinding wheel passing over a plate",
  "custom-cutting": "Drawing beside a part cut to shape",
};

export function ServicesPreview() {
  return (
    <section className="py-24 lg:py-36">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionHeading
              kicker="Processing services"
              title="Cut, machined and ground before it leaves us."
            />
          </Reveal>
          <Reveal>
            <Link href="/services/" className="text-[15px] text-gold underline-offset-8 hover:underline">
              All services
            </Link>
          </Reveal>
        </div>
        <ul className="mt-16 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:mt-20 xl:grid-cols-4">
          {getServices().map((s, i) => (
            <Reveal as="li" key={s.slug} delay={i * 0.08}>
              <Link href={`/services/${s.slug}/`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]">
                    <ImageSlot label={s.name} shot={shots[s.slug]} className="h-full w-full" />
                  </div>
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold transition-colors group-hover:text-gold">
                  {s.name}
                </h3>
                <p className="mt-2 leading-relaxed text-mist">{s.summary}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
