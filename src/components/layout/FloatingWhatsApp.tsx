"use client";

import { WhatsAppIcon } from "@/components/ui/icons";
import { useWhatsAppUrl } from "@/lib/use-whatsapp-url";

type Props = { whatsapp: string; gradeNames: Record<string, string> };

/** Reads the address (to name the grade), so it sits inside <Suspense>. */
export function FloatingWhatsApp({ whatsapp, gradeNames }: Props) {
  return <FloatingWhatsAppView whatsappUrl={useWhatsAppUrl(whatsapp, gradeNames)} />;
}

export function FloatingWhatsAppView({ whatsappUrl }: { whatsappUrl: string }) {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed right-8 bottom-8 z-30 hidden h-14 items-center gap-0 overflow-hidden rounded-full bg-[#1F7A4A] pr-4 pl-4 text-white shadow-[0_10px_30px_rgb(0_0_0/0.45)] transition-[gap,padding] duration-500 hover:gap-3 hover:pr-6 lg:inline-flex"
    >
      <WhatsAppIcon className="h-6 w-6 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[15px] font-medium transition-[max-width] duration-500 group-hover:max-w-40">
        Chat on WhatsApp
      </span>
    </a>
  );
}
