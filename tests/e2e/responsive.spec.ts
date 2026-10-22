import { expect, test } from "@playwright/test";

const grades = ["p20", "p20-ni", "h13", "h11", "d2", "skd11", "skd61", "ohns", "hchcr"];
const categories = [
  "plastic-mould-steel", "hot-work-die-steel", "cold-work-tool-steel", "high-speed-steel",
  "en-series-engineering-steel", "alloy-steel", "mould-base-plates", "other-steel-grades",
];
const services = ["bandsaw-cutting", "precision-machining", "surface-grinding", "custom-cutting"];
const routes = [
  "/", "/about/", "/products/", "/services/", "/contact/", "/quote/", "/clients-partners/?preview=1",
  ...categories.map((c) => `/products/${c}/`),
  ...grades.map((g) => `/grades/${g}/`),
  ...services.map((s) => `/services/${s}/`),
];

for (const width of [1920, 1440, 1024, 768, 480, 360]) {
  test(`no horizontal scroll or script errors at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
    await page.setViewportSize({ width, height: 900 });
    const overflow: string[] = [];
    for (const route of routes) {
      await page.goto(route);
      const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      if (sw > iw) {
        const culprit = await page.evaluate(() => {
          const w = window.innerWidth;
          const el = [...document.querySelectorAll("body *")].find((e) => e.getBoundingClientRect().right > w + 1);
          return el ? `${el.tagName}.${(el.className || "").toString().slice(0, 60)}` : "unknown";
        });
        overflow.push(`${route} (${sw}px) ${culprit}`);
      }
    }
    expect(overflow).toEqual([]);
    expect(errors).toEqual([]);
  });
}
