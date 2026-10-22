// Enquiry management for the admin panel. Callers must have checked the user's role.
import "server-only";
import type { LeadStatus, Prisma } from "@/generated/prisma/client";
import { LEAD_STATUSES, STATUS_LABEL } from "@/lib/lead-status";
import { db } from "./db";

export { LEAD_STATUSES, STATUS_LABEL };

export type LeadFilter = { status?: string; q?: string; page?: number; pageSize?: number };

function where({ status, q }: LeadFilter): Prisma.LeadWhereInput {
  const term = q?.trim();
  return {
    ...(status && LEAD_STATUSES.includes(status as LeadStatus) ? { status: status as LeadStatus } : {}),
    ...(term
      ? {
          OR: ["name", "company", "reference", "gradeName", "email", "phone"].map((field) => ({
            [field]: { contains: term, mode: "insensitive" as const },
          })),
        }
      : {}),
  };
}

export async function listLeads(filter: LeadFilter) {
  const pageSize = filter.pageSize ?? 25;
  const page = Math.max(1, filter.page ?? 1);
  const [rows, total] = await Promise.all([
    db.lead.findMany({
      where: where(filter),
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { uploads: true } } },
    }),
    db.lead.count({ where: where(filter) }),
  ]);
  return { rows, total, page, pageSize };
}

export const getLead = (id: string) =>
  db.lead.findUnique({ where: { id }, include: { uploads: { orderBy: { createdAt: "asc" } } } });

const stamp = (by: string) =>
  `${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}, ${by}`;

async function appendNote(id: string, line: string) {
  const lead = await db.lead.findUniqueOrThrow({ where: { id }, select: { notes: true } });
  return lead.notes ? `${lead.notes}\n${line}` : line;
}

export async function setLeadStatus(id: string, status: LeadStatus, by: string) {
  if (!LEAD_STATUSES.includes(status)) throw new Error("Unknown status");
  const lead = await db.lead.findUniqueOrThrow({ where: { id }, select: { status: true } });
  if (lead.status === status) return;
  const notes = await appendNote(id, `[${stamp(by)}] ${by}: status ${STATUS_LABEL[lead.status]} → ${STATUS_LABEL[status]}`);
  await db.lead.update({ where: { id }, data: { status, notes } });
}

export async function addLeadNote(id: string, text: string, by: string) {
  const clean = text.trim().replace(/\s+/g, " ").slice(0, 1000);
  if (!clean) throw new Error("The note is empty.");
  await db.lead.update({ where: { id }, data: { notes: await appendNote(id, `[${stamp(by)}] ${by}: ${clean}`) } });
}

/** One CSV cell. Values starting with = + - @ (or tab/CR) are prefixed with ' so Excel never runs them. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

type CsvLead = Awaited<ReturnType<typeof listLeads>>["rows"][number];

export function leadsToCsv(rows: CsvLead[]): string {
  const header = ["Reference", "Received", "Status", "Name", "Company", "Phone", "Email", "Grade", "Service", "Dimensions", "Quantity", "Message", "Files", "Page"];
  const lines = rows.map((l) =>
    [
      l.reference,
      l.createdAt.toISOString(),
      STATUS_LABEL[l.status],
      l.name,
      l.company,
      l.phone,
      l.email,
      l.gradeName,
      l.service,
      l.dimensions,
      l.quantity,
      l.message,
      l._count.uploads,
      l.pagePath,
    ]
      .map(csvCell)
      .join(","),
  );
  // BOM so Excel reads UTF-8 (₹, °C, names in Indian scripts) correctly.
  return "﻿" + [header.join(","), ...lines].join("\r\n");
}

export async function exportLeads(filter: LeadFilter) {
  return leadsToCsv((await listLeads({ ...filter, page: 1, pageSize: 10_000 })).rows);
}
