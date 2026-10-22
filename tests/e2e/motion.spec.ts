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

test("page is complete at rest without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const hiddenText = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("h1, h2, h3, p")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom <= 0 || r.top >= innerHeight) return false; // only what is on screen
          for (let n: Element | null = el; n; n = n.parentElement) {
            if (Number(getComputedStyle(n).opacity) < 0.99) return true;
          }
          return false;
        })
        .map((el) => el.textContent?.slice(0, 40)),
    );
  await page.goto("/");
  await page.waitForTimeout(2500);
  expect(await hiddenText()).toEqual([]);
  // Hero headline is in its final position, not still translated down.
  const t = await page.locator("h1 span span").first().evaluate((el) => getComputedStyle(el).transform);
  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(t);
  // Every section is fully visible once scrolled into view.
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(50);
    const vh = await page.evaluate(() => innerHeight);
    await page.evaluate((top) => window.scrollTo(0, top), y + Math.round(vh * 0.6));
    await page.waitForTimeout(50);
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(50);
  }
  await context.close();
});

test("sections are fully visible after scrolling into view", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const ids = await page.locator("[data-reveal]").count();
  for (let i = 0; i < ids; i++) {
    const el = page.locator("[data-reveal]").nth(i);
    await el.evaluate((n) => n.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(80);
    expect(Number(await el.evaluate((n) => getComputedStyle(n).opacity))).toBeGreaterThan(0.99);
  }
});
