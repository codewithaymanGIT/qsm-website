import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Product } from "@/content/types";
import { formatRange } from "@/lib/format";

const NOTE = "Typical values. Confirm against mill certificate.";

/** Datasheet-style block: composition, properties and heat treatment on a light ground. */
export function TechnicalData({ product }: { product: Product }) {
  return (
    <section aria-labelledby="tech-data" className="bg-surface py-24 text-ink lg:py-32">
      <Container>
        <Reveal>
          <p className="mb-5 text-sm font-medium text-gold-deep">Technical data</p>
          <h2 id="tech-data" className="text-h2 font-semibold">
            {product.name} at a glance
          </h2>
        </Reveal>

        <Reveal className="mt-14">
          <div className="overflow-x-auto border border-ink/12">
            <table className="w-full min-w-[520px] border-collapse text-left tabular-nums">
              <caption className="border-b border-ink/12 px-5 py-4 text-left">
                <span className="font-display text-lg font-semibold">Chemical composition</span>
                <span className="ml-3 text-sm text-neutral-600">wt %</span>
              </caption>
              <thead>
                <tr className="bg-ink/[0.04]">
                  {product.composition.map((c) => (
                    <th key={c.element} scope="col" className="px-5 py-3 font-display text-base font-semibold">
                      {c.element}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {product.composition.map((c) => (
                    <td key={c.element} className="px-5 py-4 whitespace-nowrap text-neutral-700">
                      {formatRange(c.min, c.max)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-neutral-600">{NOTE}</p>
        </Reveal>

        <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h3 className="font-display text-2xl font-semibold">Mechanical properties</h3>
            <dl className="mt-6 border-t border-ink/12">
              {product.mechanical.map((m) => (
                <div key={m.label} className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-ink/12 py-4">
                  <dt className="text-neutral-600">{m.label}</dt>
                  <dd className="font-medium tabular-nums">{m.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-neutral-600">{NOTE}</p>
          </Reveal>
          <Reveal>
            <h3 className="font-display text-2xl font-semibold">Heat treatment</h3>
            <ol className="mt-6 border-t border-ink/12">
              {product.heatTreatment.map((h, i) => (
                <li key={h.step} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-ink/12 py-4">
                  <span className="font-display font-semibold text-gold-deep tabular-nums">{i + 1}</span>
                  <div>
                    <p className="font-medium">{h.step}</p>
                    <p className="mt-1 text-neutral-600">{h.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-neutral-600">
              Guidance only. Follow your heat treater&apos;s procedure for section size and furnace.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
