import { describe, expect, it } from "vitest";
import {
  getCategories,
  getCategory,
  getGallery,
  getPartners,
  getProduct,
  getProducts,
  getProductsByCategory,
  getRelatedProducts,
  getServices,
  getSettings,
  getTimeline,
} from "@/lib/content";

describe("content (database-backed)", () => {
  it("has the 8 categories in the agreed order", async () => {
    expect((await getCategories()).map((c) => c.slug)).toEqual([
      "plastic-mould-steel",
      "hot-work-die-steel",
      "cold-work-tool-steel",
      "high-speed-steel",
      "en-series-engineering-steel",
      "alloy-steel",
      "mould-base-plates",
      "other-steel-grades",
    ]);
  });

  it("has the 9 initial grades, each in an existing category", async () => {
    const products = await getProducts();
    expect(products.map((p) => p.slug).sort()).toEqual(
      ["p20", "p20-ni", "h13", "h11", "d2", "skd11", "skd61", "ohns", "hchcr"].sort(),
    );
    for (const p of products) expect(await getCategory(p.categorySlug)).toBeDefined();
  });

  it("keeps grade technical data intact through the database", async () => {
    const h13 = await getProduct("h13");
    expect(h13?.composition).toContainEqual({ element: "Cr", min: 4.75, max: 5.5 });
    expect(h13?.heatTreatment.map((h) => h.step)).toEqual(["Preheating", "Hardening", "Tempering"]);
    expect(h13?.datasheets).toEqual([]);
  });

  it("groups grades by category", async () => {
    expect((await getProductsByCategory("hot-work-die-steel")).map((p) => p.slug).sort()).toEqual(["h11", "h13", "skd61"]);
    expect(await getProductsByCategory("high-speed-steel")).toEqual([]);
  });

  it("returns related grades excluding the grade itself", async () => {
    const related = await getRelatedProducts("h13");
    expect(related).toHaveLength(3);
    expect(related.map((p) => p.slug)).not.toContain("h13");
    expect(await getProduct("nope")).toBeUndefined();
  });

  it("has 4 services in order", async () => {
    expect((await getServices()).map((s) => s.slug)).toEqual([
      "bandsaw-cutting",
      "precision-machining",
      "surface-grinding",
      "custom-cutting",
    ]);
  });

  it("only states verified timeline facts", async () => {
    expect((await getTimeline()).map((t) => t.year)).toEqual(["2002", "2009", "2013", "Today"]);
    // The warehouse location is never published.
    expect(JSON.stringify(await getTimeline())).not.toMatch(/bhosari/i);
  });

  it("lists the customers the owner confirmed, and has gallery slots", async () => {
    expect((await getPartners()).map((p) => p.name)).toEqual([
      "Maruti Suzuki",
      "Tata",
      "Mahindra",
      "Bhilai Steel Plant (SAIL)",
      "Sandvik Coromant",
    ]);
    expect((await getGallery()).length).toBeGreaterThanOrEqual(6);
  });

  it("never exposes a warehouse address", async () => {
    expect(Object.keys(await getSettings()).join(" ")).not.toMatch(/warehouse/i);
  });

  it("contains no prices, stock levels or invented credentials", async () => {
    const all = JSON.stringify({
      c: await getCategories(),
      p: await getProducts(),
      s: await getServices(),
      t: await getTimeline(),
    });
    expect(all).not.toMatch(/₹|\bprice|in stock|award|certified|ISO 9001|clients include/i);
  });

  it("uses the owner's confirmed details", async () => {
    expect((await getSettings()).email).toBe("qualitysteelsmetals@yahoo.com");
    const hchcr = await getProduct("hchcr");
    expect(hchcr?.equivalents).toContain("AISI D3");
    expect(hchcr?.overview).not.toMatch(/D2/);
  });

  it("states the processing the owner confirmed is done in-house", async () => {
    const machining = (await getServices()).find((s) => s.slug === "precision-machining");
    expect(machining?.description.join(" ")).toMatch(/in-house/);
  });

  it("ships official logos for four customers", async () => {
    const byName = Object.fromEntries((await getPartners()).map((p) => [p.name, p.src]));
    expect(byName["Tata"]).toBe("/clients/tata.png");
    expect(byName["Bhilai Steel Plant (SAIL)"]).toBe("/clients/sail.png");
  });

  it("serves a customer logo from a project file or an uploaded file", async () => {
    const { db } = await import("@/lib/server/db");
    const tata = await db.partnerLogo.findFirstOrThrow({ where: { name: "Tata" } });
    await db.partnerLogo.update({ where: { id: tata.id }, data: { imageKey: "/clients/tata.png" } });
    const maruti = await db.partnerLogo.findFirstOrThrow({ where: { name: "Maruti Suzuki" } });
    await db.partnerLogo.update({ where: { id: maruti.id }, data: { imageKey: "abc123.png" } });
    const byName = Object.fromEntries((await getPartners()).map((p) => [p.name, p.src]));
    expect(byName["Tata"]).toBe("/clients/tata.png");
    expect(byName["Maruti Suzuki"]).toBe("/files/abc123.png");
    expect(byName["Sandvik Coromant"]).toBeNull();
    await db.partnerLogo.update({ where: { id: maruti.id }, data: { imageKey: "/clients/maruti-suzuki.png" } });
  });
});
