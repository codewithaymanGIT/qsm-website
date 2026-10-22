import { telHref } from "@/lib/whatsapp";
import type { Metadata } from "next";
import { Enquiry } from "@/components/forms/Enquiry";
import { Container } from "@/components/ui/Container";
import { PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { PageHero } from "@/components/ui/PageHero";
import { getSettings } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, WhatsApp or email Quality Steel and Metals for tool steel, die steel and mould steel enquiries.",
};

export default async function ContactPage() {
  const s = await getSettings();
  // A maps link only helps once the address has a PIN code; without one it can point to the wrong place.
  const addressKnown = /\b\d{6}\b/.test(s.officeAddress);
  return (
    <>
      <PageHero title="Talk to us." intro="Call or WhatsApp for the quickest answer. For drawings and detailed requirements, use the enquiry form." />
      <section className="py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-20">
          <div>
            <p className="text-sm text-mist">Your contact</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">{s.contactName}</h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a href={buildWhatsAppUrl(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2.5 bg-[#1F7A4A] px-6 font-medium text-white hover:bg-[#25915a]">
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp
              </a>
              <a href={telHref(s.phone)} className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-white/25 px-6 font-medium hover:border-gold hover:text-gold">
                <PhoneIcon className="h-5 w-5" />
                Call
              </a>
            </div>
            <dl className="mt-10 border-t border-white/10">
              <Row label="Phone" value={s.phone} />
              <Row label="WhatsApp" value={s.whatsapp} />
              <Row label="Email" value={s.email} />
              <Row label="Office" value={s.officeAddress} />
            </dl>
            {s.mapEmbedUrl ? (
              <iframe
                title="Office location on Google Maps"
                src={s.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="mt-8 aspect-[4/3] w-full border-0 grayscale invert-[0.9]"
              />
            ) : (
              addressKnown && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.officeAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex min-h-11 items-center text-gold underline-offset-4 hover:underline"
                >
                  Open in Google Maps
                </a>
              )
            )}
          </div>
          <Enquiry title="Send an enquiry" />
        </Container>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-white/10 py-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
      <dt className="text-mist">{label}</dt>
      <dd className="select-all">{value}</dd>
    </div>
  );
}
