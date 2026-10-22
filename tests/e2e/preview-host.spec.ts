import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Mimics the artifact host: the page is wrapped in the host's skeleton,
// served from a sub-path, under a CSP that allows only inline CSS/JS,
// data: fonts and Google Fonts. Run `node scripts/build-preview.mjs` first.
const file = path.join(__dirname, "../../preview/index.html");
const CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' https://cdnjs.cloudflare.com",
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  "font-src data: https://fonts.gstatic.com",
  "img-src data: blob:",
  "connect-src 'self'",
].join("; ");
const URL = "https://preview.test/artifact/abc123/";

test.skip(!fs.existsSync(file), "preview not built");

// Other published pages are served as-is from their path under the artifact.
function serveFile(route: import("@playwright/test").Route) {
  const rel = new globalThis.URL(route.request().url()).pathname.replace("/artifact/abc123/", "");
  const p = path.join(__dirname, "../../preview", rel);
  if (!rel || !fs.existsSync(p) || fs.statSync(p).isDirectory()) return route.fulfill({ status: 404, body: "" });
  return route.fulfill({
    status: 200,
    contentType: "text/html",
    headers: { "content-security-policy": CSP },
    body: fs.readFileSync(p, "utf8"),
  });
}

for (const width of [1440, 390]) {
  test(`preview renders under host restrictions at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("https://preview.test/**", (route) => {
      if (route.request().url() !== URL) return serveFile(route);
      const body =
        '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>:root{color-scheme:light}body{margin:0;padding:0;font:14px sans-serif;background:#fff;color:#000}</style></head><body>\n' +
        fs.readFileSync(file, "utf8");
      return route.fulfill({ status: 200, contentType: "text/html", headers: { "content-security-policy": CSP }, body });
    });
    await page.setViewportSize({ width, height: 844 });
    await page.goto(URL);
    await page.waitForTimeout(1500);

    const h1 = page.locator("h1");
    expect(parseFloat(await h1.evaluate((el) => getComputedStyle(el).fontSize))).toBeGreaterThan(40);
    expect(await h1.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Inter Tight/);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(10, 26, 51)");
    await expect(page.getByRole("link", { name: "Skip to content" })).not.toBeInViewport();

    if (width < 1024) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    }
    if (process.env.SHOT) await page.screenshot({ path: `${process.env.SHOT}-${width}.png` });
    // Expected in the preview only: React re-requests the original asset files
    // (blocked; their inlined copies are already applied) and reports a
    // recoverable hydration mismatch (#418) caused by the host's wrapper markup.
    const expected = /404|Failed to fetch|prefetch|RSC payload|Refused to load .*\/(_next|icon\.svg)|React error #418|^Event$/i;
    const fatal = errors.filter((e) => !expected.test(e));
    expect(fatal).toEqual([]);
  });
}

test("preview navigates between pages under host restrictions", async ({ page }) => {
  await page.route("https://preview.test/**", (route) => {
    if (route.request().url() !== URL) return serveFile(route);
    return route.fulfill({
      status: 200,
      contentType: "text/html",
      headers: { "content-security-policy": CSP },
      body: "<!doctype html><html><head></head><body>\n" + fs.readFileSync(file, "utf8"),
    });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  await page.waitForTimeout(800);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Products" }).click();
  await expect(page).toHaveURL("https://preview.test/artifact/abc123/products/index.html");
  await expect(page.locator("h1")).toHaveText("Tool, die and mould steel.");
  await page.waitForTimeout(500);
  await page.locator('main a[href*="hot-work-die-steel"]').first().click();
  await expect(page.locator("h1")).toHaveText("Hot Work Die Steel");
  await page.waitForTimeout(500);
  await page.getByRole("link", { name: /^H13\b/ }).click();
  await expect(page).toHaveURL("https://preview.test/artifact/abc123/grades/h13/index.html");
  await expect(page.locator("h1")).toHaveText("H13");
  expect(parseFloat(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontSize))).toBeGreaterThan(60);
});

test("preview quote form validates using code loaded on demand", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://preview.test/**", (route) => serveFile(route));
  await page.goto("https://preview.test/artifact/abc123/quote/index.html?grade=h13");
  await page.waitForLoadState("networkidle");
  await expect(page.getByLabel("Steel grade")).toHaveValue("h13");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  // Same expected preview-only noise as above (blocked original asset requests, hydration notice).
  expect(errors.filter((e) => !/#418|^Event$/.test(e))).toEqual([]);
});
