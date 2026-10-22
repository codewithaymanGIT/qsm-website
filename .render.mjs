import { chromium } from "@playwright/test";
import fs from "node:fs";
const [dir, outDir] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".svg"))) {
  const svg = fs.readFileSync(`${dir}/${f}`, "utf8");
  await p.setContent(`<html><body style="margin:0"><img id="i" src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}" style="width:600px;height:auto;display:block"></body></html>`);
  await p.waitForTimeout(300);
  let box = await p.locator("#i").boundingBox();
  if (box.height > 240) {
    await p.locator("#i").evaluate((el) => { el.style.width = "auto"; el.style.height = "240px"; });
    box = await p.locator("#i").boundingBox();
  }
  await p.locator("#i").screenshot({ path: `${outDir}/${f.replace(".svg", ".png")}`, omitBackground: true });
  console.log(f, Math.round(box.width), "x", Math.round(box.height));
}
await b.close();
