import type { Metadata } from "next";
import { Enquiry } from "@/components/forms/Enquiry";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { getSettings } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Send the grade, size and quantity you need, with drawings or CAD files. Quality Steel and Metals will reply with a quotation.",
};

export default async function QuotePage() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Request a quote." intro="Tell us the grade, size and quantity. Attach a drawing or CAD file if you have one." />
      <section className="py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
          <Enquiry title="Your enquiry" />
          <aside className="lg:pt-10">
            <h2 className="font-display text-2xl font-semibold">Prefer to talk?</h2>
            <p className="mt-4 leading-relaxed text-mist">Most of our customers send a WhatsApp message or call. Both reach the same team.</p>
            <dl className="mt-8 border-t border-white/10">
              <div className="border-b border-white/10 py-4">
                <dt className="text-sm text-mist">WhatsApp</dt>
                <dd className="mt-1">
                  <a href={buildWhatsAppUrl(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-lg hover:text-accent">
                    {s.whatsapp}
                  </a>
                </dd>
              </div>
              <div className="border-b border-white/10 py-4">
                <dt className="text-sm text-mist">Phone</dt>
                <dd className="mt-1 text-lg select-all">{s.phone}</dd>
              </div>
              <div className="border-b border-white/10 py-4">
                <dt className="text-sm text-mist">Email</dt>
                <dd className="mt-1 text-lg select-all">{s.email}</dd>
              </div>
            </dl>
            <h2 className="mt-12 font-display text-xl font-semibold">What happens next</h2>
            <ol className="mt-4 space-y-3 text-mist">
              <li>1. We check the grade and size against stock.</li>
              <li>2. If the grade needs sourcing, we tell you the options.</li>
              <li>3. You receive a quotation by phone, WhatsApp or email.</li>
            </ol>
          </aside>
        </Container>
      </section>
    </>
  );
}
