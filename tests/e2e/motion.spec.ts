import { expect, test } from "@playwright/test";

test("content is visible immediately with reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForTimeout(500);
  const opacities = await page
    .locator("[data-reveal]")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
  expect(opacities.length).toBeGreaterThan(0);
  for (const o of opacities) expect(o).toBe("1");
  await context.close();
});

test("mobile action bar offers WhatsApp, call and quote", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const bar = page.locator("[data-action-bar]");
  await expect(bar).toBeVisible();
  const hrefs = await bar.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
  expect(hrefs.some((h) => h.startsWith("https://wa.me/"))).toBe(true);
  expect(hrefs.some((h) => h.startsWith("tel:"))).toBe(true);
  expect(hrefs.some((h) => h.startsWith("/quote"))).toBe(true);
});

test("action bar is hidden on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-action-bar]")).toBeHidden();
});
