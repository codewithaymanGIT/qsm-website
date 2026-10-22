// Builds the private review link: each exported page becomes one
// self-contained HTML file (CSS, fonts and scripts inlined), because the
// preview host blocks separately served stylesheets and scripts.
// Production deployments use the normal `next build` output instead.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out");
const dest = path.join(root, "preview");
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ["index.html"];

execSync("npx next build", { cwd: root, stdio: "inherit" });

const read = (p) => fs.readFileSync(path.join(out, p.replace(/^\//, "").split("?")[0]));

// The host rejects a raw U+FFFD; the escape is equivalent inside JS and CSS strings.
const clean = (s) => s.replaceAll("�", "\\uFFFD");

function inlineCss(href) {
  const dir = path.posix.dirname(href);
  const css = read(href)
    .toString("utf8")
    .replace(/url\((\.\.\/media\/[^)]+\.woff2)\)/g, (_, rel) => {
      const font = read(path.posix.join(dir, rel)).toString("base64");
      return `url(data:font/woff2;base64,${font})`;
    });
  return `<style>${clean(css)}</style>`;
}

// Inlined scripts have no src, but Turbopack identifies chunks (and Next its
// asset prefix) from document.currentScript.src. Give each the path it had.
const CHUNK_HEADER = '"object"==typeof document?document.currentScript:void 0';
const ASSET_PREFIX = "let e=document.currentScript;if(!(e instanceof HTMLScriptElement))";

function inlineScript(src) {
  let js = read(src).toString("utf8");
  js = js.replaceAll(CHUNK_HEADER, `{getAttribute:()=>${JSON.stringify(src)}}`);
  js = js.replaceAll(ASSET_PREFIX, `let e={src:location.origin+${JSON.stringify(src)}};if(!1)`);
  js = clean(js).replaceAll("</script", "<\\/script");
  return `<script>${js}</script>`;
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

for (const page of pages) {
  let html = read(page).toString("utf8");
  html = html
    .replace(/<link rel="preload"[^>]*as="font"[^>]*\/>/g, "")
    .replace(/<link rel="stylesheet" href="([^"]+)"[^>]*\/>/g, (_, href) => inlineCss(href))
    .replace(/<link rel="preload" as="script"[^>]*href="([^"]+)"[^>]*\/>/g, (_, src) => inlineScript(src))
    .replace(/<script src="[^"]+" noModule=""><\/script>/g, "")
    .replace(/<script src="([^"]+)" async=""><\/script>/g, (_, src) => inlineScript(src))
    .replace(/<link rel="icon" href="[^"]+"[^>]*\/>/, () => {
      const svg = read("icon.svg").toString("base64");
      return `<link rel="icon" href="data:image/svg+xml;base64,${svg}" type="image/svg+xml"/>`;
    });
  if (!html.includes("getAttribute:()=>")) throw new Error(`${page}: chunk header patch did not apply`);
  const leftovers = html.match(/(src|href)="\/_next[^"]*"/g);
  if (leftovers) throw new Error(`${page}: unresolved assets ${leftovers.join(", ")}`);
  const file = path.join(dest, page);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, clean(html));
  console.log(`${page}: ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}
