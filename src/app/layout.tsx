import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { getProducts, getSettings } from "@/lib/content";
import { getNavLinks } from "@/lib/nav";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Quality Steel and Metals | Tool Steel, Die Steel & Mould Steel Since 2002",
    template: "%s | Quality Steel and Metals",
  },
  description:
    "Importer, stockist, distributor and trader of tool steel, die steel, plastic mould steel and special alloy steel since 2002, with cutting, machining and grinding services.",
  openGraph: { type: "website", siteName: "Quality Steel and Metals", locale: "en_IN" },
};

export const viewport: Viewport = { themeColor: "#0A0A0A" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const whatsappUrl = buildWhatsAppUrl(settings.whatsapp);
  const gradeNames = Object.fromEntries((await getProducts()).map((p) => [p.slug, p.name]));
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} antialiased`}>
      <body className="min-h-screen bg-ink text-surface">
        <a
          href="#main"
          className="fixed top-2 left-2 z-[60] -translate-y-20 bg-gold px-4 py-2 text-ink focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Header links={await getNavLinks()} phone={settings.phone} whatsappUrl={whatsappUrl} />
        <main id="main">{children}</main>
        <Footer />
        <MobileActionBar phone={settings.phone} whatsapp={settings.whatsapp} gradeNames={gradeNames} />
        <FloatingWhatsApp whatsapp={settings.whatsapp} gradeNames={gradeNames} />
      </body>
    </html>
  );
}
