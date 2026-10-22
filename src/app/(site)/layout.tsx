import { Suspense } from "react";
import { FloatingWhatsApp, FloatingWhatsAppView } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { Header, HeaderView } from "@/components/layout/Header";
import { MobileActionBar, MobileActionBarView } from "@/components/layout/MobileActionBar";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { getProducts, getSettings } from "@/lib/content";
import { getNavLinks } from "@/lib/nav";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Public website chrome: header, footer and the always-visible contact actions.
 * The address-aware parts sit in <Suspense> so pages can re-render after an admin edit
 * (the fallback is the same markup, minus the highlighted section and grade name).
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const whatsappUrl = buildWhatsAppUrl(settings.whatsapp);
  const gradeNames = Object.fromEntries((await getProducts()).map((p) => [p.slug, p.name]));
  const links = await getNavLinks();
  return (
    <>
      <a href="#main" className="fixed top-2 left-2 z-[60] -translate-y-20 bg-accent px-4 py-2 text-ink focus:translate-y-0">
        Skip to content
      </a>
      <SmoothScroll />
      <Suspense fallback={<HeaderView links={links} phone={settings.phone} whatsappUrl={whatsappUrl} pathname="" />}>
        <Header links={links} phone={settings.phone} whatsappUrl={whatsappUrl} />
      </Suspense>
      <main id="main">{children}</main>
      <Footer />
      <Suspense fallback={<MobileActionBarView phone={settings.phone} whatsappUrl={whatsappUrl} />}>
        <MobileActionBar phone={settings.phone} whatsapp={settings.whatsapp} gradeNames={gradeNames} />
      </Suspense>
      <Suspense fallback={<FloatingWhatsAppView whatsappUrl={whatsappUrl} />}>
        <FloatingWhatsApp whatsapp={settings.whatsapp} gradeNames={gradeNames} />
      </Suspense>
    </>
  );
}
