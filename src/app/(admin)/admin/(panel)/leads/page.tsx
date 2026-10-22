import Link from "next/link";
import { Suspense } from "react";
import { rolesFor } from "@/components/admin/nav";
import { StatusPill } from "@/components/admin/StatusPill";
import { adminButton, adminGhostButton, adminInput, card, Loading, PageTitle } from "@/components/admin/ui";
import { LEAD_STATUSES, STATUS_LABEL } from "@/lib/lead-status";
import { requireUser } from "@/lib/server/auth";
import { listLeads } from "@/lib/server/leads-admin";

type Search = { status?: string; q?: string; page?: string };

export default function LeadsPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <>
      <PageTitle title="Enquiries" />
      <Suspense fallback={<Loading />}>
        <LeadList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const fmt = (d: Date) => d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

async function LeadList({ searchParams }: { searchParams: Promise<Search> }) {
  await requireUser(rolesFor("/admin/leads/"));
  const sp = await searchParams;
  const { rows, total, page, pageSize } = await listLeads({ status: sp.status, q: sp.q, page: Number(sp.page) || 1 });
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const qs = (extra: Record<string, string | number>) =>
    `?${new URLSearchParams({ ...(sp.status ? { status: sp.status } : {}), ...(sp.q ? { q: sp.q } : {}), ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])) })}`;

  return (
    <div className="space-y-6">
      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 basis-56">
          <label htmlFor="q" className="mb-1.5 block text-sm text-mist">
            Search
          </label>
          <input id="q" name="q" defaultValue={sp.q} placeholder="Name, company, reference, grade, phone" className={adminInput} />
        </div>
        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm text-mist">
            Status
          </label>
          <select id="status" name="status" defaultValue={sp.status ?? ""} className={adminInput}>
            <option value="">All</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={adminButton}>
          Filter
        </button>
        <a href={`/admin/leads/export/${qs({})}`} className={adminGhostButton}>
          Export to Excel
        </a>
      </form>

      <p className="text-sm text-mist">
        {total} {total === 1 ? "enquiry" : "enquiries"}
      </p>

      {rows.length === 0 ? (
        <p className="text-mist">No enquiries match. Try another search or status.</p>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[760px] text-left text-[15px]">
            <thead className="border-b border-white/10 text-sm text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Grade / service</th>
                <th className="px-4 py-3 font-medium">Files</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((l) => (
                <tr key={l.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 tabular-nums">
                    <Link href={`/admin/leads/${l.id}/`} className="text-accent hover:underline">
                      {l.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-mist tabular-nums">{fmt(l.createdAt)}</td>
                  <td className="px-4 py-3">
                    {l.name}
                    {l.company && <span className="block text-sm text-mist">{l.company}</span>}
                  </td>
                  <td className="px-4 py-3">{l.gradeName ?? l.service ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{l._count.uploads || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="flex items-center gap-3 text-sm">
          {page > 1 && (
            <Link href={qs({ page: page - 1 })} className={adminGhostButton}>
              Previous
            </Link>
          )}
          <span className="text-mist">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link href={qs({ page: page + 1 })} className={adminGhostButton}>
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
