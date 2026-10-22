import type { LeadStatus } from "@/generated/prisma/enums";

// Shared by server code and admin UI (no server-only imports here).
export const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST", "SPAM"];
export const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTED: "Quoted",
  WON: "Won",
  LOST: "Lost",
  SPAM: "Spam",
};
