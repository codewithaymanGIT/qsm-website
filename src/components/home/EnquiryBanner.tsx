import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";

export function EnquiryBanner({ whatsappUrl }: { whatsappUrl: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-28 lg:py-44">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute top-[18%] -right-[10%] h-16 w-[55%] bg-gradient-to-r from-[#1D5BD8] via-[#79B6EA] to-[#2F6FE0] opacity-25 sm:h-24" />
        <div className="absolute top-[42%] -right-[4%] h-16 w-[55%] bg-gradient-to-r from-[#0E2242] via-[#2A4A7A] to-[#0B1C38] opacity-70 sm:h-24" />
        <div className="absolute top-[66%] right-[2%] h-16 w-[55%] bg-gradient-to-r from-[#0E2242] via-[#2A4A7A] to-[#0B1C38] opacity-40 sm:h-24" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
      </div>
      <Container>
        <Reveal>
          <h2 className="max-w-[16ch] font-display text-[clamp(2.75rem,8vw,8rem)] leading-[0.95] font-semibold tracking-[-0.03em]">
            Looking For The Right Steel Grade?
          </h2>
        </Reveal>
        <Reveal>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-surface/70">
            Tell us the grade, size and quantity. If you are not sure which grade fits, describe the job and we will
            suggest one.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href={whatsappUrl} external variant="ghost" className="border-[#2fa560]/60 hover:border-[#5BD47E] hover:text-[#5BD47E]">
              <WhatsAppIcon className="h-5 w-5" />
              Chat on WhatsApp
            </Button>
            <Button href="/quote/">Request quote</Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
