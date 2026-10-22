import { expect, test } from "@playwright/test";

const grades = [
  ["p20", "P20"],
  ["p20-ni", "P20+Ni"],
  ["h13", "H13"],
  ["h11", "H11"],
  ["d2", "D2"],
  ["skd11", "SKD11"],
  ["skd61", "SKD61"],
  ["ohns", "OHNS"],
  ["hchcr", "HCHCR"],
] as const;

for (const [slug, name] of grades) {
  test(`grade page ${name} shows identity and technical data`, async ({ page }) => {
    await page.goto(`/grades/${slug}/`);
    await expect(page.locator("h1")).toHaveText(name);
    await expect(page).toHaveTitle(`${name} Steel | Quality Steel and Metals`);
    const composition = page.getByRole("table", { name: /chemical composition/i });
    await expect(composition).toContainText("Cr");
    await expect(page.getByText("Typical values. Confirm against mill certificate.").first()).toBeVisible();
    await expect(page.getByText("Mill test certificates available on request.")).toBeVisible();
    // No downloads exist yet, so the section is hidden rather than empty.
    await expect(page.getByRole("heading", { name: /downloads/i })).toHaveCount(0);
    const related = page.getByRole("region", { name: /related grades/i }).getByRole("link");
    await expect(related).toHaveCount(3);
  });
}

test("grade WhatsApp links are prefilled with the encoded grade", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/grades/p20-ni/");
  const barHref = await page.locator("[data-action-bar] a").first().getAttribute("href");
  expect(barHref).toContain("P20%2BNi%20Steel");
  const inPage = await page.locator('main a[href^="https://wa.me/"]').first().getAttribute("href");
  expect(inPage).toContain("P20%2BNi%20Steel");
});

test("quote buttons carry the grade", async ({ page }) => {
  await page.goto("/grades/h13/");
  await expect(page.locator('main a[href="/quote/?grade=h13"]').first()).toBeVisible();
});

test("category pages list their grades or invite an enquiry", async ({ page }) => {
  await page.goto("/products/hot-work-die-steel/");
  await expect(page.locator("h1")).toHaveText("Hot Work Die Steel");
  for (const g of ["H13", "H11", "SKD61"]) await expect(page.getByRole("link", { name: new RegExp(`^${g}\\b`) })).toBeVisible();
  await page.goto("/products/high-speed-steel/");
  await expect(page.getByText(/tell us the grade you need/i)).toBeVisible();
});

test("products index links every category", async ({ page }) => {
  await page.goto("/products/");
  await expect(page.locator('main a[href^="/products/"]')).toHaveCount(8);
});
