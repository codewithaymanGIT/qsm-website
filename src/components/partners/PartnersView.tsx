import Link from "next/link";
import { CustomerBadge, CustomerMarquee } from "@/components/customers/CustomerBadge";
import { Container } from "@/components/ui/Container";
import type { PartnerLogo } from "@/content/types";

export function PartnersView({ partners }: { partners: PartnerLogo[] }) {
  if (partners.length === 0) return <NotFoundBlock />;
  return (
    <>
      <section className="steel-texture grain relative border-b border-white/8 pt-36 pb-16 lg:pt-44 lg:pb-24">
        <Container>
          <h1 className="text-display max-w-[16ch] font-semibold">Companies we have supplied.</h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-surface/70">
            Manufacturers and steel makers who rely on us for tool steel, die steel and processing.
          </p>
        </Container>
      </section>
      <section aria-label="Customer logos" className="py-20 lg:py-24">
        <CustomerMarquee customers={partners} />
        <Container className="mt-16">
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <li key={p.id} className="[&>div]:w-full">
                <CustomerBadge customer={p} />
              </li>
            ))}
          </ul>
        </Container>
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
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center bg-accent px-7 font-medium text-ink hover:bg-[#79B6EA]">
          Go to the homepage
        </Link>
      </Container>
    </section>
  );
}
