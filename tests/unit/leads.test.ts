import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/lib/server/db";
import { LeadValidationError, RateLimitError, submitLead } from "@/lib/server/leads";
import { POST } from "@/app/api/leads/route";

const year = new Date().getFullYear();
const pdf = (name = "drawing.pdf") => new File([Buffer.from("%PDF-1.7\n1 0 obj\n")], name, { type: "application/pdf" });
const fields = {
  name: "Ravi Kumar",
  company: "Kumar Tools",
  phone: "+91 98200 00000",
  email: "ravi@example.com",
  grade: "h13",
  dimensions: "Round 120 mm x 300 mm",
  quantity: "4 pieces",
  message: "Need mill certificate.",
};
let ipCounter = 0;
const freshIp = () => `10.0.0.${++ipCounter}`;

afterEach(() => {
  delete process.env.SMTP_URL;
});

describe("submitLead", () => {
  it("saves a valid enquiry with a reference and a privately stored drawing", async () => {
    const { reference, id } = await submitLead({ fields, drawing: pdf(), ip: freshIp() });
    expect(reference).toBe(`QSM-${year}-0001`);
    const lead = await db.lead.findUniqueOrThrow({ where: { id }, include: { uploads: true } });
    expect(lead).toMatchObject({ name: "Ravi Kumar", gradeSlug: "h13", gradeName: "H13", status: "NEW" });
    expect(lead.ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(lead.uploads).toHaveLength(1);
    const stored = path.join(process.env.UPLOAD_DIR!, lead.uploads[0].storedName);
    expect(fs.existsSync(stored)).toBe(true);
    expect(stored).not.toContain(`${path.sep}public${path.sep}`);
  });

  it("never derives the stored file name from the visitor's file name", async () => {
    const { id } = await submitLead({ fields, drawing: pdf("../../etc/passwd.pdf"), ip: freshIp() });
    const [upload] = await db.upload.findMany({ where: { leadId: id } });
    expect(upload.storedName).toMatch(/^[0-9a-f-]{36}\.pdf$/);
    expect(upload.originalName).toBe("passwd.pdf");
  });

  it("rejects a disguised file and saves nothing", async () => {
    const before = await db.lead.count();
    const exe = new File([Buffer.from("MZ\x90\x00")], "drawing.pdf");
    await expect(submitLead({ fields, drawing: exe, ip: freshIp() })).rejects.toMatchObject({
      errors: { drawing: expect.stringMatching(/does not look like a PDF/) },
    });
    expect(await db.lead.count()).toBe(before);
  });

  it("reports field errors from the shared schema", async () => {
    const err = await submitLead({ fields: { ...fields, phone: "123" }, ip: freshIp() }).catch((e) => e);
    expect(err).toBeInstanceOf(LeadValidationError);
    expect(err.errors.phone).toMatch(/10 digits/);
  });

  it("keeps the enquiry when email is not configured, recording why", async () => {
    const { id } = await submitLead({ fields, ip: freshIp() });
    const lead = await db.lead.findUniqueOrThrow({ where: { id } });
    expect(lead.emailSentAt).toBeNull();
    expect(lead.emailError).toMatch(/SMTP_URL is not set/);
  });

  it("marks the enquiry as emailed when sending succeeds", async () => {
    process.env.SMTP_URL = "json://";
    const { id } = await submitLead({ fields, ip: freshIp() });
    const lead = await db.lead.findUniqueOrThrow({ where: { id } });
    expect(lead.emailSentAt).not.toBeNull();
    expect(lead.emailError).toBeNull();
  });

  it("allows 5 enquiries per visitor in 10 minutes, then blocks", async () => {
    const ip = freshIp();
    for (let i = 0; i < 5; i++) await submitLead({ fields, ip });
    await expect(submitLead({ fields, ip })).rejects.toBeInstanceOf(RateLimitError);
  });
});

describe("POST /api/leads", () => {
  const post = (form: FormData, headers: Record<string, string> = {}) =>
    POST(new Request("http://localhost/api/leads", { method: "POST", body: form, headers: { "x-forwarded-for": freshIp(), ...headers } }));

  const formWith = (extra: Record<string, string | File> = {}) => {
    const f = new FormData();
    for (const [k, v] of Object.entries({ ...fields, ...extra })) f.append(k, v);
    return f;
  };

  it("returns 201 with the reference", async () => {
    const res = await post(formWith({ drawing: pdf() }));
    expect(res.status).toBe(201);
    expect((await res.json()).reference).toMatch(new RegExp(`^QSM-${year}-\\d{4}$`));
  });

  it("returns 400 with field errors", async () => {
    const res = await post(formWith({ email: "nope" }));
    expect(res.status).toBe(400);
    expect((await res.json()).errors.email).toBeDefined();
  });

  it("silently drops submissions that fill the spam trap", async () => {
    const before = await db.lead.count();
    const res = await post(formWith({ website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(await db.lead.count()).toBe(before);
  });

  it("refuses oversized requests before reading them", async () => {
    const res = await post(formWith(), { "content-length": String(60 * 1024 * 1024) });
    expect(res.status).toBe(413);
  });

  it("returns 429 when the visitor is rate limited", async () => {
    const ip = "10.9.9.9";
    for (let i = 0; i < 5; i++) await post(formWith(), { "x-forwarded-for": ip });
    const res = await post(formWith(), { "x-forwarded-for": ip });
    expect(res.status).toBe(429);
  });
});
