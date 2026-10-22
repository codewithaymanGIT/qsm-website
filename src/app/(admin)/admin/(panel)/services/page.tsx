import Link from "next/link";
import { Suspense } from "react";
import { rolesFor } from "@/components/admin/nav";
import { card, Loading, PageTitle } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export default function ServicesPage() {
  return (
    <>
      <PageTitle title="Services" />
      <Suspense fallback={<Loading />}>
        <Services />
      </Suspense>
    </>
  );
}

async function Services() {
  await requireUser(rolesFor("/admin/services/"));
  const services = await db.service.findMany({ orderBy: { order: "asc" } });
  return (
    <ul className={`${card} divide-y divide-white/10`}>
      {services.map((s) => (
        <li key={s.id}>
          <Link href={`/admin/services/${s.id}/`} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4 hover:bg-white/[0.03]">
            <span>
              <span className="font-medium">{s.name}</span> <span className="ml-2 text-sm text-mist">{s.summary}</span>
            </span>
            {!s.published && <span className="text-xs tracking-wide text-[#FFC27A] uppercase">Hidden</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
