import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowIcon } from "@/components/ui/icons";
import { getCategories, getProductsByCategory } from "@/lib/content";

// The homepage brief labels the last category "Specialized Steels".
const homeLabels: Record<string, string> = { "other-steel-grades": "Specialized Steels" };

export function CategoryCards({ showHeading = true, homeLabelsOn = true }: { showHeading?: boolean; homeLabelsOn?: boolean }) {
  const categories = getCategories();
  return (
    <section className="py-24 lg:py-36">
      <Container>
        {showHeading && <Reveal>
          <SectionHeading
            kicker="Products"
            title="Steel for the tools that make everything else."
            intro="Eight families of tool, die, mould and alloy steel. Open a category to see the grades we supply and their technical data."
          />
        </Reveal>}
        <ul className={`grid gap-5 xl:grid-cols-2 ${showHeading ? "mt-16 lg:mt-20" : ""}`}>
          {categories.map((c) => {
            const grades = getProductsByCategory(c.slug);
            return (
              <Reveal as="li" key={c.slug}>
                <Link
                  href={`/products/${c.slug}/`}
                  className="group grid h-full grid-cols-1 overflow-hidden border border-white/8 bg-graphite transition-colors duration-500 hover:border-gold/50 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:min-h-64">
                    <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
                      <ImageSlot label={c.name} shot="Close-up of this steel family in stock" className="h-full w-full" />
                    </div>
                  </div>
                  <div className="flex flex-col p-7 sm:p-8">
                    <h3 className="text-h3 font-semibold">{(homeLabelsOn && homeLabels[c.slug]) || c.name}</h3>
                    <p className="mt-4 leading-relaxed text-mist">{c.shortDescription}</p>
                    <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                      <p className="text-sm text-surface/60">
                        {grades.length > 0 ? grades.map((g) => g.name).join(", ") : "Ask us about available grades"}
                      </p>
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-white/15 transition-colors duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                        <ArrowIcon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
