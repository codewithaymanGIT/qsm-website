import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const reasons = [
  {
    title: "Imported grades",
    body: "Tool, die and mould steels from mills in China, Taiwan, Germany, Japan, Italy and Austria, alongside Indian mills, to recognised AISI, DIN and JIS specifications.",
  },
  {
    title: "Precision processing",
    body: "Bandsaw cutting, machining and surface grinding, so material reaches your toolroom closer to finished size.",
  },
  {
    title: "Reliable supply",
    body: "Stock held ready and a straight answer on what is available, so you can plan production with confidence.",
  },
  {
    title: "Experienced team",
    body: "More than two decades in tool steel. We help you choose the right grade for the job, not just the one on the shelf.",
  },
  {
    title: "Custom sourcing",
    body: "When a grade or size is not in stock, we source it to your specification.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-surface py-24 text-ink lg:py-36">
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <SectionHeading
              tone="light"
              kicker="Why Quality Steel and Metals"
              title="The right grade, at the right size, when you need it."
            />
          </Reveal>
        </div>
        <ul className="border-t border-ink/12">
          {reasons.map((r) => (
            <Reveal as="li" key={r.title} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-b border-ink/12 py-9 sm:grid-cols-[5rem_minmax(0,1fr)] sm:py-11">
              <span aria-hidden="true" className="mt-4 block h-1.5 w-8 bg-gold" />
              <div>
                <h3 className="text-h3 font-semibold">{r.title}</h3>
                <p className="mt-3 max-w-xl text-lg leading-relaxed text-neutral-600">{r.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
