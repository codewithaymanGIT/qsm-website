import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { getProducts, getSettings } from "@/lib/content";
import { getNavLinks } from "@/lib/nav";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/** Public website chrome: header, footer and the always-visible contact actions. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const whatsappUrl = buildWhatsAppUrl(settings.whatsapp);
  const gradeNames = Object.fromEntries((await getProducts()).map((p) => [p.slug, p.name]));
  return (
    <>
      <a href="#main" className="fixed top-2 left-2 z-[60] -translate-y-20 bg-gold px-4 py-2 text-ink focus:translate-y-0">
        Skip to content
      </a>
      <SmoothScroll />
      <Header links={await getNavLinks()} phone={settings.phone} whatsappUrl={whatsappUrl} />
      <main id="main">{children}</main>
      <Footer />
      <MobileActionBar phone={settings.phone} whatsapp={settings.whatsapp} gradeNames={gradeNames} />
      <FloatingWhatsApp whatsapp={settings.whatsapp} gradeNames={gradeNames} />
    </>
  );
}
