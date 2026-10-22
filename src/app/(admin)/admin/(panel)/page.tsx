import Link from "next/link";
import { Suspense } from "react";
import { card, Loading, PageTitle } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export default function DashboardPage() {
  return (
    <>
      <PageTitle title="Dashboard" />
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  const user = await requireUser();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [fresh, thisMonth, latest] = await Promise.all([
    db.lead.count({ where: { status: "NEW" } }),
    db.lead.count({ where: { createdAt: { gte: monthStart } } }),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  return (
    <div className="space-y-10">
      <p className="text-mist">Signed in as {user.name}.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/leads/?status=NEW" className={`${card} block p-6 hover:border-accent/50`}>
          <p className="text-sm text-mist">New enquiries</p>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums">{fresh}</p>
        </Link>
        <div className={`${card} p-6`}>
          <p className="text-sm text-mist">Enquiries this month</p>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums">{thisMonth}</p>
        </div>
      </div>
      <section aria-labelledby="latest">
        <h2 id="latest" className="mb-4 font-display text-xl font-semibold">
          Latest enquiries
        </h2>
        {latest.length === 0 ? (
          <p className="text-mist">No enquiries yet. They appear here as soon as someone sends the quote form.</p>
        ) : (
          <ul className={`${card} divide-y divide-white/10`}>
            {latest.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}/`} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4 hover:bg-white/5">
                  <span>
                    <span className="font-medium">{l.name}</span>
                    {l.company && <span className="text-mist"> · {l.company}</span>}
                  </span>
                  <span className="text-sm text-mist tabular-nums">
                    {l.reference} · {l.gradeName ?? l.service ?? "General"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
