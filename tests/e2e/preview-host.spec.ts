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

for (const width of [1440, 390]) {
  test(`preview renders under host restrictions at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("https://preview.test/**", (route) => {
      if (route.request().url() !== URL) return route.fulfill({ status: 404, body: "" });
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
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(10, 10, 10)");
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
