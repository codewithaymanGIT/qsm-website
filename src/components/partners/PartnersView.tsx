"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PartnerLogo } from "@/content/types";
import { Container } from "@/components/ui/Container";

// Neutral shapes for previewing the layout. Never real company names.
const samples: PartnerLogo[] = Array.from({ length: 8 }, (_, i) => ({ id: `s${i}`, name: `Sample logo ${i + 1}`, src: "" }));

export function PartnersView({ partners }: { partners: PartnerLogo[] }) {
  const preview = useSearchParams().get("preview") === "1";
  const logos = partners.length > 0 ? partners : preview ? samples : [];
  if (logos.length === 0) return <NotFoundBlock />;

  return (
    <>
      <section className="steel-texture grain relative border-b border-white/8 pt-36 pb-16 lg:pt-44 lg:pb-24">
        <Container>
          {partners.length === 0 && (
            <p className="mb-6 inline-block border border-gold/50 px-3 py-1.5 text-sm text-gold">Layout preview with sample shapes</p>
          )}
          <h1 className="text-display max-w-[16ch] font-semibold">Clients &amp; partners.</h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-surface/70">Companies we are proud to supply and work with.</p>
        </Container>
      </section>
      <section aria-label="Logos" className="overflow-hidden py-20 lg:py-28">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-5 hover:[animation-play-state:paused]">
          {[...logos, ...logos].map((l, i) => (
            <div
              key={`${l.id}-${i}`}
              data-logo=""
              aria-hidden={i >= logos.length ? true : undefined}
              className="flex h-32 w-60 shrink-0 items-center justify-center border border-white/10 bg-graphite px-8"
            >
              {l.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.src} alt={l.name} className="max-h-16 w-auto opacity-80 grayscale" loading="lazy" />
              ) : (
                <span className="flex items-center gap-3 text-surface/40">
                  <span className="h-8 w-8 bg-white/15" />
                  <span className="h-3 w-24 bg-white/15" />
                  <span className="sr-only">{l.name}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function NotFoundBlock() {
  return (
    <section className="flex min-h-[70svh] items-center pt-28">
      <Container>
        <h1 className="text-h2 font-semibold">Page not found</h1>
        <p className="mt-5 max-w-lg text-lg text-mist">This page is not available yet.</p>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center bg-gold px-7 font-medium text-ink hover:bg-[#d8b679]">
          Go to the homepage
        </Link>
      </Container>
    </section>
  );
}
