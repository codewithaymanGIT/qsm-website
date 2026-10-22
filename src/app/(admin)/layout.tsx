import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | QSM Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0B1B36]">{children}</div>;
}
