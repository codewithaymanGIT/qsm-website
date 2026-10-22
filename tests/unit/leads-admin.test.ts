import { describe, expect, it } from "vitest";
import { db } from "@/lib/server/db";
import { addLeadNote, csvCell, leadsToCsv, listLeads, setLeadStatus } from "@/lib/server/leads-admin";
import { submitLead } from "@/lib/server/leads";

const base = { name: "Asha Rao", company: "Rao Moulds", phone: "+91 90000 11111", email: "asha@example.com", grade: "p20", dimensions: "", quantity: "", message: "" };
let n = 0;
const ip = () => `172.16.0.${++n}`;

describe("csvCell", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell('Flat, "50" x 200\nmm')).toBe('"Flat, ""50"" x 200\nmm"');
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell(null)).toBe("");
  });

  it("neutralises spreadsheet formulas typed by visitors", () => {
    for (const evil of ["=HYPERLINK(\"http://x\")", "+cmd", "-2+3", "@SUM(A1)", "\t=1", "\r=1"]) {
      expect(csvCell(evil).replace(/^"/, "").startsWith("'")).toBe(true);
    }
  });
});

describe("leadsToCsv", () => {
  it("starts with a byte-order mark and header row for Excel", () => {
    const csv = leadsToCsv([]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1).split("\r\n")[0]).toBe(
      "Reference,Received,Status,Name,Company,Phone,Email,Grade,Service,Dimensions,Quantity,Message,Files,Page",
    );
  });
});

describe("listLeads", () => {
  it("filters by status and searches across name, company, reference and grade", async () => {
    const a = await submitLead({ fields: { ...base, name: "Zubin Search Target" }, ip: ip() });
    await submitLead({ fields: { ...base, name: "Someone Else" }, ip: ip() });
    const found = await listLeads({ q: "search target" });
    expect(found.rows.map((r) => r.reference)).toContain(a.reference);
    expect(found.rows.every((r) => /search target/i.test(r.name))).toBe(true);
    const byRef = await listLeads({ q: a.reference });
    expect(byRef.rows).toHaveLength(1);
    await setLeadStatus(a.id, "QUOTED", "Test Sales");
    expect((await listLeads({ status: "QUOTED" })).rows.map((r) => r.id)).toEqual([a.id]);
  });

  it("pages results, newest first", async () => {
    for (let i = 0; i < 3; i++) await submitLead({ fields: base, ip: ip() });
    const page1 = await listLeads({ pageSize: 2 });
    expect(page1.rows).toHaveLength(2);
    expect(page1.total).toBeGreaterThan(2);
    expect(page1.rows[0].createdAt >= page1.rows[1].createdAt).toBe(true);
  });
});

describe("status and notes", () => {
  it("records who changed the status and keeps free notes in order", async () => {
    const { id } = await submitLead({ fields: base, ip: ip() });
    await setLeadStatus(id, "CONTACTED", "Test Sales");
    await addLeadNote(id, "Called, wants MTC.", "Test Sales");
    const lead = await db.lead.findUniqueOrThrow({ where: { id } });
    expect(lead.status).toBe("CONTACTED");
    const lines = lead.notes!.split("\n");
    expect(lines[0]).toMatch(/Test Sales: status New → Contacted$/);
    expect(lines[1]).toMatch(/Test Sales: Called, wants MTC\.$/);
  });

  it("rejects an unknown status and an empty note", async () => {
    const { id } = await submitLead({ fields: base, ip: ip() });
    await expect(setLeadStatus(id, "BOGUS" as never, "x")).rejects.toThrow();
    await expect(addLeadNote(id, "   ", "x")).rejects.toThrow(/empty/);
  });
});
