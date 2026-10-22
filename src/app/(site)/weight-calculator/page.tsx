import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { WeightCalculator, WeightCalculatorFromUrl } from "@/components/calculator/WeightCalculator";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { getProducts } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/weight-calculator/", {
    title: "Steel Weight Calculator",
    description:
      "Calculate the weight of round bars, flats, blocks, plates, square, hexagon and hollow bars in kg, by tool steel grade. Free steel weight calculator.",
  });
}

export default async function WeightCalculatorPage() {
  const grades = (await getProducts()).map((p) => ({ slug: p.slug, name: p.name }));
  return (
    <>
      <PageHero
        title="Steel weight calculator"
        intro="Work out the weight of a bar, block or plate before you order. Choose the grade and shape, enter the size in millimetres."
      />
      <section className="py-20 lg:py-28">
        <Container>
          <Suspense fallback={<WeightCalculator grades={grades} />}>
            <WeightCalculatorFromUrl grades={grades} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
