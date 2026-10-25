import { CustomerBadge } from "@/components/customers/CustomerBadge";
import { Container } from "@/components/ui/Container";
import type { PartnerLogo } from "@/content/types";

/** Steel mills, under the heading set in Admin → Contact & timeline. Hidden when there are none. */
export function MillLogos({ mills, heading }: { mills: PartnerLogo[]; heading: string }) {
  if (mills.length === 0) return null;
  return (
    <section aria-labelledby="mills" className="border-b border-white/8 py-16 lg:py-20">
      <Container>
        <h2 id="mills" className="mb-10 font-display text-2xl font-semibold sm:text-3xl">
          {heading}
        </h2>
        {/* Wrapping row with the last row centred, like the customer grid. */}
        <ul className="flex flex-wrap justify-center gap-5">
          {mills.map((m) => (
            <li key={m.id} className="w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] [&>div]:w-full">
              <CustomerBadge customer={m} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
