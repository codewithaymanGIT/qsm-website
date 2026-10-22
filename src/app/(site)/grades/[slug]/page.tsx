import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Enquiry } from "@/components/forms/Enquiry";
import { GradeEnquiry } from "@/components/product/GradeEnquiry";
import { TechnicalData } from "@/components/product/TechnicalData";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowIcon, WhatsAppIcon } from "@/components/ui/icons";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import type { Download } from "@/content/types";
import { getCategory, getProduct, getProducts, getRelatedProducts, getSettings } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";


export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/grades/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name} Steel`,
    description: `${product.name} (${product.equivalents.join(", ")}): ${product.tagline.toLowerCase()}. Composition, hardness, heat treatment and applications. Request a quote from Quality Steel and Metals.`,
  };
}

export default async function GradePage({ params }: PageProps<"/grades/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const category = (await getCategory(product.categorySlug))!;
  const whatsappUrl = buildWhatsAppUrl((await getSettings()).whatsapp, product.name);
  const quoteHref = `/quote/?grade=${product.slug}`;
  const related = await getRelatedProducts(product.slug);

  return (
    <>
      <PageHero
        huge
        title={product.name}
        crumbs={[
          { href: "/products/", label: "Products" },
          { href: `/products/${category.slug}/`, label: category.name },
        ]}
      >
        <div className="hero-fade mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between" style={{ animationDelay: "0.15s" }}>
          <div>
            <p className="text-xl text-surface/80 sm:text-2xl">{product.tagline}</p>
            <ul aria-label="Equivalent designations" className="mt-5 flex flex-wrap gap-2">
              {product.equivalents.map((e) => (
                <li key={e} className="border border-white/15 px-3 py-1.5 text-sm text-surface/75">
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={quoteHref}>Request quote</Button>
            <Button href={whatsappUrl} external variant="ghost">
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp
            </Button>
          </div>
        </div>
      </PageHero>

      <section aria-labelledby="overview" className="py-24 lg:py-32">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-24">
          <Reveal>
            <h2 id="overview" className="mb-5 text-sm font-medium text-gold">
              Overview
            </h2>
            <p className="font-display text-[clamp(1.5rem,2.6vw,2.4rem)] leading-snug font-medium tracking-[-0.015em]">
              {product.overview}
            </p>
          </Reveal>
          <Reveal>
            <h2 className="mb-5 text-sm font-medium text-gold">Specifications</h2>
            <dl className="border-t border-white/10">
              <Spec label="Category" value={category.name} />
              <Spec label="Hardness" value={product.hardness} />
              <Spec label="Available forms" value={product.forms.join(", ")} />
              <Spec label="Equivalents" value={product.equivalents.join(", ")} />
              <Spec label="Certificates" value="Mill test certificates available on request." />
            </dl>
            <Link href={`/weight-calculator/?grade=${product.slug}`} className="mt-6 inline-flex min-h-11 items-center gap-2 text-gold underline-offset-4 hover:underline">
              Calculate {product.name} weight <ArrowIcon className="h-4 w-4" />
            </Link>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="applications" className="border-t border-white/8 bg-graphite py-24 lg:py-32">
        <Container className="grid gap-14 md:grid-cols-2 lg:gap-24">
          <Reveal>
            <h2 id="applications" className="text-h3 font-semibold">
              Applications
            </h2>
            <ul className="mt-8 border-t border-white/10">
              {product.applications.map((a) => (
                <li key={a} className="border-b border-white/10 py-4 text-lg">
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <h2 className="text-h3 font-semibold">Industries served</h2>
            <ul className="mt-8 flex flex-wrap gap-2">
              {product.industries.map((i) => (
                <li key={i} className="border border-white/15 px-4 py-2 text-surface/80">
                  {i}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <TechnicalData product={product} />

      <Downloads datasheets={product.datasheets} certificates={product.certificates} />

      <section aria-labelledby="related" className="py-24 lg:py-32">
        <Container>
          <Reveal>
            <h2 id="related" className="text-h2 font-semibold">
              Related grades
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-px bg-white/8 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug} className="bg-ink">
                <Link href={`/grades/${r.slug}/`} className="group flex h-full flex-col p-7 transition-colors hover:bg-graphite">
                  <span className="font-display text-5xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-gold">
                    {r.name}
                  </span>
                  <span className="mt-3 text-mist">{r.tagline}</span>
                  <ArrowIcon className="mt-8 h-5 w-5 text-surface/50 transition-colors group-hover:text-gold" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <GradeEnquiry title={`Request a quote for ${product.name}`} whatsappUrl={whatsappUrl} quoteHref={quoteHref}>
        <Enquiry defaultGrade={product.slug} title={`Enquire about ${product.name}`} />
      </GradeEnquiry>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-white/10 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
      <dt className="text-mist">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/** Hidden until datasheets or certificates are uploaded. */
function Downloads({ datasheets, certificates }: { datasheets: Download[]; certificates: Download[] }) {
  const files = [...datasheets, ...certificates];
  if (files.length === 0) return null;
  return (
    <section aria-labelledby="downloads" className="border-t border-white/8 py-24">
      <Container>
        <h2 id="downloads" className="text-h3 font-semibold">
          Downloads
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {files.map((f) => (
            <li key={f.href}>
              <a href={f.href} className="flex items-center justify-between border border-white/12 px-5 py-4 hover:border-gold">
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
