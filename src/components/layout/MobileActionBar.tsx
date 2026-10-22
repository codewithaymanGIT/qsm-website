"use client";

import { telHref } from "@/lib/whatsapp";
import Link from "next/link";
import { PhoneIcon, QuoteIcon, WhatsAppIcon } from "@/components/ui/icons";
import { useWhatsAppUrl } from "@/lib/use-whatsapp-url";

type Props = { phone: string; whatsapp: string; gradeNames: Record<string, string> };

/** Always-visible contact bar on phones and tablets. Reads the address, so it sits inside <Suspense>. */
export function MobileActionBar({ phone, whatsapp, gradeNames }: Props) {
  return <MobileActionBarView phone={phone} whatsappUrl={useWhatsAppUrl(whatsapp, gradeNames)} />;
}

export function MobileActionBarView({ phone, whatsappUrl }: { phone: string; whatsappUrl: string }) {
  const item = "flex flex-1 flex-col items-center justify-center gap-1 text-[12px] font-medium min-h-14";
  return (
    <div
      data-action-bar
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${item} text-[#5BD47E]`}>
        <WhatsAppIcon className="h-5 w-5" />
        WhatsApp
      </a>
      <a href={telHref(phone)} className={`${item} border-x border-white/10 text-surface`}>
        <PhoneIcon className="h-5 w-5" />
        Call
      </a>
      <Link href="/quote/" className={`${item} bg-accent text-ink`}>
        <QuoteIcon className="h-5 w-5" />
        Get a quote
      </Link>
    </div>
  );
}
