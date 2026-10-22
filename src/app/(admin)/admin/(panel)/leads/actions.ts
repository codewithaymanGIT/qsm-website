"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { rolesFor } from "@/components/admin/nav";
import { LEAD_STATUSES } from "@/lib/lead-status";
import { requireUser } from "@/lib/server/auth";
import { addLeadNote, setLeadStatus } from "@/lib/server/leads-admin";

const statusInput = z.object({ id: z.string().min(1), status: z.enum(LEAD_STATUSES as [string, ...string[]]) });
const noteInput = z.object({ id: z.string().min(1), note: z.string().trim().min(1, "Write a note first.").max(1000) });

export async function updateLeadStatus(form: FormData) {
  const user = await requireUser(rolesFor("/admin/leads/"));
  const { id, status } = statusInput.parse(Object.fromEntries(form));
  await setLeadStatus(id, status as never, user.name);
  revalidatePath(`/admin/leads/${id}/`);
}

export async function addNote(form: FormData) {
  const user = await requireUser(rolesFor("/admin/leads/"));
  const parsed = noteInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  await addLeadNote(parsed.data.id, parsed.data.note, user.name);
  revalidatePath(`/admin/leads/${parsed.data.id}/`);
}
