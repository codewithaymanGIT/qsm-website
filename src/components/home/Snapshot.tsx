import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const roles = [
  { name: "Importer", line: "Tool and die steel grades brought in from overseas." },
  { name: "Stockist", line: "Material held ready, so you are not waiting on a mill." },
  { name: "Distributor", line: "Supplying toolrooms, mould makers and manufacturers." },
  { name: "Trader", line: "Specific grades sourced when your job calls for them." },
];

export function Snapshot() {
  return (
    <section aria-label="Company snapshot" className="border-y border-white/8 bg-graphite">
      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] lg:gap-16 lg:py-20">
        <Reveal>
          <p className="text-[15px] text-mist">Established</p>
          <p className="mt-1 font-display text-[clamp(4.5rem,11vw,9.5rem)] leading-[0.9] font-semibold tracking-[-0.04em] text-gold">
            2002
          </p>
        </Reveal>
        <ul className="grid grid-cols-1 gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
          {roles.map((r, i) => (
            <Reveal as="li" key={r.name} delay={i * 0.08} className="bg-graphite p-6 sm:p-7">
              <span aria-hidden="true" className="mb-6 block h-1.5 w-10 bg-gold/80" style={{ marginLeft: i * 6 }} />
              <h2 className="font-display text-2xl font-semibold">{r.name}</h2>
              <p className="mt-3 leading-relaxed text-mist">{r.line}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
