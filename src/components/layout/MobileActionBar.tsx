import Link from "next/link";
import { PhoneIcon, QuoteIcon, WhatsAppIcon } from "@/components/ui/icons";

type Props = { phone: string; whatsappUrl: string };

/** Always-visible contact bar on phones and tablets. */
export function MobileActionBar({ phone, whatsappUrl }: Props) {
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
      <a href={`tel:${phone}`} className={`${item} border-x border-white/10 text-surface`}>
        <PhoneIcon className="h-5 w-5" />
        Call
      </a>
      <Link href="/quote/" className={`${item} bg-gold text-ink`}>
        <QuoteIcon className="h-5 w-5" />
        Get a quote
      </Link>
    </div>
  );
}
