import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { TimelineEntry } from "@/content/types";

export function FounderTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <section className="relative overflow-hidden border-y border-white/8 bg-graphite py-24 lg:py-36">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-24">
          <Reveal>
            <p className="mb-5 text-sm font-medium text-gold">Our story</p>
            <h2 className="font-display text-[clamp(2.75rem,6.5vw,6.5rem)] leading-[0.95] font-semibold tracking-[-0.03em]">
              It started with Rs&nbsp;500.
            </h2>
          </Reveal>
          <Reveal className="self-end">
            <p className="max-w-xl text-lg leading-relaxed text-surface/75">
              In 2002, Hemant Agrawal started Quality Steel and Metals with Rs 500 and a simple idea: give toolmakers
              the steel they ask for, explain it honestly and deliver when promised. Every relationship since has
              been built the same way, one order at a time.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-20 lg:mt-28">
          <div
            aria-hidden="true"
            data-draw=""
            className="absolute top-[11px] left-0 hidden h-px w-full origin-left bg-gold/70 md:block"
          />
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[11px] w-px bg-gold/50 md:hidden"
          />
          <ol className="grid gap-14 md:grid-cols-2 md:gap-10">
            {entries.map((e, i) => (
              <Reveal as="li" key={e.year} className="relative pl-12 md:pl-0">
                <span
                  aria-hidden="true"
                  className={`absolute top-0 left-0 block h-[23px] w-[23px] border-2 border-gold ${
                    i === entries.length - 1 ? "bg-gold" : "bg-graphite"
                  }`}
                />
                <p className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-semibold text-gold md:mt-12">
                  {e.year}
                </p>
                <h3 className="mt-5 font-display text-2xl font-semibold">{e.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-mist">{e.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
