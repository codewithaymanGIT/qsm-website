import type { LeadStatus } from "@/generated/prisma/client";
import { STATUS_LABEL } from "@/lib/lead-status";

// Semantic colours, separate from the brand accent, so state reads at a glance.
const STYLE: Record<LeadStatus, string> = {
  NEW: "bg-sky-400/15 text-sky-300 border-sky-400/40",
  CONTACTED: "bg-amber-400/15 text-amber-200 border-amber-400/40",
  QUOTED: "bg-violet-400/15 text-violet-200 border-violet-400/40",
  WON: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
  LOST: "bg-white/5 text-mist border-white/15",
  SPAM: "bg-rose-400/10 text-rose-300 border-rose-400/30",
};

export function StatusPill({ status }: { status: LeadStatus }) {
  return <span className={`inline-flex items-center border px-2.5 py-0.5 text-xs font-medium ${STYLE[status]}`}>{STATUS_LABEL[status]}</span>;
}
