import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { quoteSchema } from "@/lib/quote-schema";
import { db } from "./db";
import { sendLeadNotification } from "./mail";
import { removeStored, storeUpload, type StoredUpload, UploadRejected } from "./storage";

export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

export class LeadValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super("Enquiry is not valid");
  }
}

export class RateLimitError extends Error {
  constructor() {
    super("Too many enquiries. Please wait a few minutes or contact us on WhatsApp.");
  }
}

export type LeadSubmission = {
  fields: Record<string, string>;
  drawing?: File | null;
  cad?: File | null;
  ip?: string | null;
  userAgent?: string | null;
};

const extraSchema = z.object({
  service: z.string().trim().max(120).optional(),
  pagePath: z.string().trim().max(300).optional(),
});

const blank = (v?: string) => (v && v.trim() ? v.trim() : null);

export function hashIp(ip: string) {
  return createHash("sha256").update(`${process.env.IP_HASH_SALT ?? ""}:${ip}`).digest("hex");
}

async function nextReference() {
  const [{ n }] = await db.$queryRaw<{ n: bigint }[]>`SELECT nextval('lead_reference_seq') AS n`;
  return `QSM-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}

/** Validates, stores files privately, saves the lead, then notifies by email (never losing the lead). */
export async function submitLead(sub: LeadSubmission): Promise<{ id: string; reference: string }> {
  const parsed = quoteSchema.safeParse(sub.fields);
  const extra = extraSchema.safeParse(sub.fields);
  if (!parsed.success || !extra.success) {
    const errors: Record<string, string> = {};
    for (const issue of [...(parsed.error?.issues ?? []), ...(extra.error?.issues ?? [])]) {
      errors[String(issue.path[0])] ??= issue.message;
    }
    throw new LeadValidationError(errors);
  }
  const data = parsed.data;

  const ipHash = sub.ip ? hashIp(sub.ip) : null;
  if (ipHash) {
    const recent = await db.lead.count({
      where: { ipHash, createdAt: { gte: new Date(Date.now() - RATE_LIMIT.windowMs) } },
    });
    if (recent >= RATE_LIMIT.max) throw new RateLimitError();
  }

  const stored: StoredUpload[] = [];
  try {
    for (const [field, kind] of [["drawing", "DRAWING"], ["cad", "CAD"]] as const) {
      const file = sub[field];
      if (!file || file.size === 0) continue;
      try {
        stored.push(await storeUpload(file, kind));
      } catch (e) {
        if (e instanceof UploadRejected) throw new LeadValidationError({ [field]: e.message });
        throw e;
      }
    }

    const product = data.grade ? await db.product.findUnique({ where: { slug: data.grade } }) : null;
    const lead = await db.lead.create({
      data: {
        reference: await nextReference(),
        name: data.name,
        company: blank(data.company),
        phone: data.phone,
        email: data.email,
        gradeSlug: product?.slug ?? null,
        gradeName: product?.name ?? null,
        service: blank(extra.data.service),
        dimensions: blank(data.dimensions),
        quantity: blank(data.quantity),
        message: blank(data.message),
        pagePath: blank(extra.data.pagePath),
        ipHash,
        userAgent: sub.userAgent?.slice(0, 300) ?? null,
        uploads: { create: stored },
      },
    });

    try {
      await sendLeadNotification({ ...lead, files: stored });
      await db.lead.update({ where: { id: lead.id }, data: { emailSentAt: new Date() } });
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      console.error(`Lead ${lead.reference}: notification email failed: ${reason}`);
      await db.lead.update({ where: { id: lead.id }, data: { emailError: reason.slice(0, 500) } });
    }
    return { id: lead.id, reference: lead.reference };
  } catch (e) {
    // Nothing half-saved: drop files if the lead itself was not stored.
    await removeStored(stored.map((s) => s.storedName));
    throw e;
  }
}
