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

describe("content", () => {
  it("has the 8 categories in the agreed order", () => {
    expect(getCategories().map((c) => c.slug)).toEqual([
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

  it("has the 9 initial grades, each in an existing category", () => {
    const products = getProducts();
    expect(products.map((p) => p.slug).sort()).toEqual(
      ["p20", "p20-ni", "h13", "h11", "d2", "skd11", "skd61", "ohns", "hchcr"].sort(),
    );
    for (const p of products) expect(getCategory(p.categorySlug)).toBeDefined();
  });

  it("groups grades by category", () => {
    expect(getProductsByCategory("hot-work-die-steel").map((p) => p.slug).sort()).toEqual(
      ["h11", "h13", "skd61"],
    );
    expect(getProductsByCategory("high-speed-steel")).toEqual([]);
  });

  it("returns related grades excluding the grade itself", () => {
    const related = getRelatedProducts("h13");
    expect(related).toHaveLength(3);
    expect(related.map((p) => p.slug)).not.toContain("h13");
    expect(getProduct("nope")).toBeUndefined();
  });

  it("has 4 services", () => {
    expect(getServices().map((s) => s.slug)).toEqual([
      "bandsaw-cutting",
      "precision-machining",
      "surface-grinding",
      "custom-cutting",
    ]);
  });

  it("only states verified timeline facts", () => {
    expect(getTimeline().map((t) => t.year)).toEqual(["2002", "Today"]);
  });

  it("starts with no partner logos and has gallery slots", () => {
    expect(getPartners()).toEqual([]);
    expect(getGallery().length).toBeGreaterThanOrEqual(6);
  });

  it("never exposes a warehouse address", () => {
    expect(Object.keys(getSettings()).join(" ")).not.toMatch(/warehouse/i);
  });

  it("contains no prices, stock levels or invented credentials", () => {
    const all = JSON.stringify({
      c: getCategories(),
      p: getProducts(),
      s: getServices(),
      t: getTimeline(),
    });
    expect(all).not.toMatch(/₹|\bprice|in stock|award|certified|ISO 9001|clients include/i);
  });
});
