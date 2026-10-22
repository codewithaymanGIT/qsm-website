import { chromium } from "@playwright/test";
const [, , url, out, w, h, full] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(url, { waitUntil: "networkidle" });
// scroll through so whileInView reveals fire
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 400) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(60); }
await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1800);
await p.screenshot({ path: out, fullPage: full === "1" });
const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
console.log("scrollWidth/innerWidth", sw, "errors", errs.length, errs.slice(0,3));
await b.close();
