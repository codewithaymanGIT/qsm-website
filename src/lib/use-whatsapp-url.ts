"use client";

import { usePathname } from "next/navigation";
import { buildWhatsAppUrl } from "./whatsapp";

/** WhatsApp link that names the grade when the visitor is on a grade page. */
export function useWhatsAppUrl(number: string, gradeNames: Record<string, string>): string {
  const pathname = usePathname();
  const slug = pathname.match(/^\/grades\/([^/]+)/)?.[1];
  return buildWhatsAppUrl(number, slug ? gradeNames[slug] : undefined);
}
