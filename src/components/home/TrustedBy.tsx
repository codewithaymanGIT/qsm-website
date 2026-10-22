import Link from "next/link";
import { CustomerMarquee } from "@/components/customers/CustomerBadge";
import { Container } from "@/components/ui/Container";
import { getPartners } from "@/lib/content";

export async function TrustedBy() {
  const customers = await getPartners();
  if (customers.length === 0) return null;
  return (
    <section aria-label="Trusted by" className="border-b border-white/8 py-16 lg:py-20">
      <Container className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Trusted by</h2>
        <Link href="/clients-partners/" className="text-[15px] text-accent underline-offset-8 hover:underline">
          Companies we have supplied
        </Link>
      </Container>
      <CustomerMarquee customers={customers} />
    </section>
  );
}
