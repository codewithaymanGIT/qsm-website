import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { rolesFor } from "@/components/admin/nav";
import { StatusPill } from "@/components/admin/StatusPill";
import { adminButton, adminGhostButton, adminInput, card, Loading } from "@/components/admin/ui";
import { LEAD_STATUSES, STATUS_LABEL } from "@/lib/lead-status";
import { requireUser } from "@/lib/server/auth";
import { getLead } from "@/lib/server/leads-admin";
import { telHref } from "@/lib/whatsapp";
import { addNote, updateLeadStatus } from "../actions";

export default function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <LeadDetail params={params} />
    </Suspense>
  );
}

const fmt = (d: Date) => d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(rolesFor("/admin/leads/"));
  const lead = await getLead((await params).id);
  if (!lead) notFound();
  const reply = `Hello ${lead.name}, thank you for your enquiry ${lead.reference}${lead.gradeName ? ` for ${lead.gradeName}` : ""}. `;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/leads/" className="text-sm text-mist hover:text-accent">
          ← All enquiries
        </Link>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-mist tabular-nums">
            {lead.reference} · {fmt(lead.createdAt)}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{lead.name}</h1>
          {lead.company && <p className="text-mist">{lead.company}</p>}
        </div>
        <StatusPill status={lead.status} />
      </div>

      <div className="flex flex-wrap gap-3">
        <a href={telHref(lead.phone)} className={adminGhostButton}>
          Call {lead.phone}
        </a>
        <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(reply)}`} target="_blank" rel="noopener noreferrer" className={adminGhostButton}>
          WhatsApp
        </a>
        <a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your enquiry ${lead.reference}`)}`} className={adminGhostButton}>
          Email {lead.email}
        </a>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="req" className={`${card} p-6`}>
          <h2 id="req" className="mb-4 font-display text-lg font-semibold">
            Requirement
          </h2>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <Row label="Grade" value={lead.gradeName} />
            <Row label="Service" value={lead.service} />
            <Row label="Dimensions" value={lead.dimensions} />
            <Row label="Quantity" value={lead.quantity} />
            <Row label="Message" value={lead.message} />
            <Row label="Sent from" value={lead.pagePath} />
            <Row label="Email sent" value={lead.emailSentAt ? fmt(lead.emailSentAt) : lead.emailError ? `No (${lead.emailError})` : "Pending"} />
          </dl>
          <h3 className="mt-6 mb-2 text-sm text-mist">Files</h3>
          {lead.uploads.length === 0 ? (
            <p className="text-mist">No files attached.</p>
          ) : (
            <ul className="space-y-2">
              {lead.uploads.map((u) => (
                <li key={u.id}>
                  <a href={`/admin/uploads/${u.id}/`} className="text-accent hover:underline">
                    {u.originalName}
                  </a>{" "}
                  <span className="text-sm text-mist">
                    {u.kind === "CAD" ? "CAD" : "Drawing"} · {kb(u.sizeBytes)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="track" className={`${card} space-y-6 p-6`}>
          <h2 id="track" className="font-display text-lg font-semibold">
            Tracking
          </h2>
          <form action={updateLeadStatus} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={lead.id} />
            <div className="min-w-0 flex-1">
              <label htmlFor="lead-status" className="mb-1.5 block text-sm text-mist">
                Status
              </label>
              <select id="lead-status" name="status" defaultValue={lead.status} className={adminInput}>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={adminButton}>
              Save status
            </button>
          </form>
          <form action={addNote} className="space-y-3">
            <input type="hidden" name="id" value={lead.id} />
            <label htmlFor="lead-note" className="block text-sm text-mist">
              Add a note
            </label>
            <textarea id="lead-note" name="note" rows={3} required maxLength={1000} className={adminInput} />
            <button type="submit" className={adminGhostButton}>
              Add note
            </button>
          </form>
          <div>
            <h3 className="mb-2 text-sm text-mist">History</h3>
            {lead.notes ? (
              <ol className="space-y-2 text-sm">
                {lead.notes.split("\n").map((n, i) => (
                  <li key={i} className="border-l-2 border-white/15 pl-3">
                    {n}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-mist">No notes yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <>
      <dt className="text-mist">{label}</dt>
      <dd className="whitespace-pre-line">{value || "—"}</dd>
    </>
  );
}
