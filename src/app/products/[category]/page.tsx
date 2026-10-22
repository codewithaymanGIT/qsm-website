import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GradeEnquiry } from "@/components/product/GradeEnquiry";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowIcon, WhatsAppIcon } from "@/components/ui/icons";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { getCategories, getCategory, getProductsByCategory, getSettings } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[category]">): Promise<Metadata> {
  const category = getCategory((await params).category);
  if (!category) return {};
  return { title: category.name, description: category.shortDescription };
}

export default async function CategoryPage({ params }: PageProps<"/products/[category]">) {
  const category = getCategory((await params).category);
  if (!category) notFound();
  const grades = getProductsByCategory(category.slug);
  const whatsappUrl = buildWhatsAppUrl(getSettings().whatsapp);
  const others = getCategories().filter((c) => c.slug !== category.slug);

  return (
    <>
      <PageHero title={category.name} intro={category.shortDescription} crumbs={[{ href: "/products/", label: "Products" }]} />

      <section aria-label="Grades" className="py-24 lg:py-32">
        <Container>
          {grades.length > 0 ? (
            <ul className="border-t border-white/10">
              {grades.map((g) => (
                <Reveal as="li" key={g.slug}>
                  <Link
                    href={`/grades/${g.slug}/`}
                    className="group grid items-baseline gap-x-10 gap-y-3 border-b border-white/10 py-9 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_auto] lg:py-12"
                  >
                    <span className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-none font-semibold tracking-[-0.04em] transition-colors duration-500 group-hover:text-gold">
                      {g.name}
                    </span>
                    <span>
                      <span className="block text-xl">{g.tagline}</span>
                      <span className="mt-2 block text-mist">{g.equivalents.join(" / ")}</span>
                    </span>
                    <span className="hidden h-12 w-12 items-center justify-center border border-white/15 transition-colors duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink md:inline-flex">
                      <ArrowIcon className="h-4 w-4" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          ) : (
            <Reveal className="max-w-3xl border border-white/10 bg-graphite p-8 sm:p-12">
              <h2 className="text-h3 font-semibold">Tell us the grade you need.</h2>
              <p className="mt-4 text-lg leading-relaxed text-mist">
                We are adding the grades in this category to the website. Send us the grade, size and quantity and we
                will confirm availability.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={whatsappUrl} external variant="ghost">
                  <WhatsAppIcon className="h-5 w-5" />
                  Ask on WhatsApp
                </Button>
                <Button href="/quote/">Request quote</Button>
              </div>
            </Reveal>
          )}
        </Container>
      </section>

      <section aria-labelledby="other-categories" className="border-t border-white/8 bg-graphite py-20">
        <Container>
          <h2 id="other-categories" className="font-display text-2xl font-semibold">
            Other categories
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {others.map((c) => (
              <li key={c.slug}>
                <Link href={`/products/${c.slug}/`} className="inline-flex min-h-11 items-center border border-white/15 px-5 text-surface/80 transition-colors hover:border-gold hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <GradeEnquiry title={`Need ${category.name.toLowerCase()}?`} whatsappUrl={whatsappUrl} quoteHref="/quote/" />
    </>
  );
}
