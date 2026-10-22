import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/brand/Logo";

/** Admin shell. The menu reads the session, so it streams in behind a boundary. */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-white/10 bg-ink px-4 py-4 lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
        <Link href="/admin/" className="mb-4 flex items-center gap-3 lg:mb-8">
          <LogoMark className="h-8 w-8" />
          <span className="font-display font-semibold">QSM Admin</span>
        </Link>
        <Suspense fallback={<div className="h-10" />}>
          <AdminNav />
        </Suspense>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</main>
    </div>
  );
}
