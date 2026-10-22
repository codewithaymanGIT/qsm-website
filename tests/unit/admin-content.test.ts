import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/server/db";
import { getProduct } from "@/lib/content";
import { AdminInputError, parseProductForm, saveProduct, saveSettings, saveTimeline } from "@/lib/server/admin-content";

function form(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

const h13Form = async () => {
  const cat = await db.category.findUniqueOrThrow({
    where: { slug: "hot-work-die-steel" },
  });
  return {
    name: "H13",
    slug: "h13",
    categoryId: cat.id,
    tagline: "Edited tagline",
    equivalents: "AISI H13, DIN 1.2344",
    overview: "Overview text.",
    applications: "Die-casting dies\n\nForging dies\n",
    industries: "Die casting",
    hardness: "≤ 229 HB",
    forms: "Round bars\nBlocks",
    order: "2",
    published: "on",
    "composition.0.element": "C",
    "composition.0.min": "0.32",
    "composition.0.max": "0.45",
    "composition.1.element": "Si",
    "composition.1.min": "",
    "composition.1.max": "1.2",
    "composition.2.element": "",
    "composition.2.min": "",
    "composition.2.max": "",
    "mechanical.0.label": "Annealed hardness",
    "mechanical.0.value": "≤ 229 HB",
    "heatTreatment.0.step": "Hardening",
    "heatTreatment.0.detail": "1000 – 1030 °C",
  };
};

// These tests edit H13, the contact details and the timeline; put them back afterwards
// so later test files see the seeded content.
let saved: { product: Awaited<ReturnType<typeof db.product.findUniqueOrThrow>>; settings: { key: string; value: unknown }[] };
beforeAll(async () => {
  saved = {
    product: await db.product.findUniqueOrThrow({ where: { slug: "h13" } }),
    settings: await db.setting.findMany({ where: { key: { in: ["contact", "timeline"] } } }),
  };
});
afterAll(async () => {
  const { id, createdAt, updatedAt, ...rest } = saved.product;
  void createdAt;
  void updatedAt;
  await db.product.update({ where: { id }, data: { ...rest, composition: rest.composition ?? [], mechanical: rest.mechanical ?? [], heatTreatment: rest.heatTreatment ?? [] } });
  for (const st of saved.settings) await db.setting.update({ where: { key: st.key }, data: { value: st.value as object } });
});

describe("parseProductForm", () => {
  it("turns form rows into the website's data shape, skipping blank rows", async () => {
    const p = parseProductForm(form(await h13Form()));
    expect(p.equivalents).toEqual(["AISI H13", "DIN 1.2344"]);
    expect(p.applications).toEqual(["Die-casting dies", "Forging dies"]);
    expect(p.composition).toEqual([
      { element: "C", min: 0.32, max: 0.45 },
      { element: "Si", max: 1.2 },
    ]);
    expect(p.mechanical).toEqual([{ label: "Annealed hardness", value: "≤ 229 HB" }]);
    expect(p.published).toBe(true);
  });

  it("explains invalid input in plain words", async () => {
    const bad = {
      ...(await h13Form()),
      slug: "H 13!",
      "composition.0.min": "abc",
    };
    try {
      parseProductForm(form(bad));
      throw new Error("expected failure");
    } catch (e) {
      expect(e).toBeInstanceOf(AdminInputError);
      expect((e as Error).message).toMatch(/Web address|number/);
    }
  });
});

describe("saving content", () => {
  it("updates a product so the website reads the change", async () => {
    const existing = await db.product.findUniqueOrThrow({
      where: { slug: "h13" },
    });
    await saveProduct(existing.id, parseProductForm(form(await h13Form())));
    expect((await getProduct("h13"))?.tagline).toBe("Edited tagline");
  });

  it("refuses a web address already used by another product", async () => {
    const d2 = await db.product.findUniqueOrThrow({ where: { slug: "d2" } });
    await expect(saveProduct(d2.id, parseProductForm(form({ ...(await h13Form()), slug: "h13" })))).rejects.toThrow(/already used/);
  });

  it("saves contact details and timeline", async () => {
    await saveSettings(
      form({
        contactName: "Mohit Agrawal",
        phone: "+91 92841 27584",
        whatsapp: "+91 92841 27584",
        email: "qualitysteelsmetals@yahoo.com",
        officeAddress: "Sanghvi Steel Compound",
        mapEmbedUrl: "",
      }),
    );
    await saveTimeline(
      form({
        "rows.0.year": "2002",
        "rows.0.title": "Start",
        "rows.0.body": "Rs 500.",
        "rows.1.year": "",
        "rows.1.title": "",
        "rows.1.body": "",
      }),
    );
    const t = await db.setting.findUniqueOrThrow({
      where: { key: "timeline" },
    });
    expect(t.value).toEqual([{ year: "2002", title: "Start", body: "Rs 500." }]);
  });

  it("rejects a map link that is not Google Maps", async () => {
    await expect(
      saveSettings(
        form({
          contactName: "M",
          phone: "1234567890",
          whatsapp: "1234567890",
          email: "a@b.co",
          officeAddress: "X",
          mapEmbedUrl: "https://evil.example/embed",
        }),
      ),
    ).rejects.toThrow(/Google Maps/);
  });
});
