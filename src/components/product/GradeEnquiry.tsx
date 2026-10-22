import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";

type Props = { title: string; whatsappUrl: string; quoteHref: string; children?: ReactNode };

/** Closing enquiry block on grade and service pages. The full form slots in as children. */
export function GradeEnquiry({ title, whatsappUrl, quoteHref, children }: Props) {
  return (
    <section aria-labelledby="enquiry" className="border-t border-white/8 py-24 lg:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
        <div>
          <h2 id="enquiry" className="text-h2 font-semibold">
            {title}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-mist">
            Share the size and quantity you need. The quickest way is WhatsApp; for drawings, use the quote form.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={whatsappUrl} external variant="ghost" className="border-[#2fa560]/60 hover:border-[#5BD47E] hover:text-[#5BD47E]">
              <WhatsAppIcon className="h-5 w-5" />
              Chat on WhatsApp
            </Button>
            <Button href={quoteHref}>Request quote</Button>
          </div>
        </div>
        {children}
      </Container>
    </section>
  );
}
