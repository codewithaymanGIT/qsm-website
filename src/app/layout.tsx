import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
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

/** Shared by the public site and the admin panel; each group adds its own chrome. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} antialiased`}>
      <body className="min-h-screen bg-ink text-surface">{children}</body>
    </html>
  );
}
