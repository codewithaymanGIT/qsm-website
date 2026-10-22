// Builds the private review link. The preview host serves static files only and
// blocks separately loaded stylesheets and scripts, so this script:
//   1. builds and starts the real server (NEXT_PUBLIC_PREVIEW=1, dev database),
//   2. crawls every page linked from the homepage,
//   3. writes each page as one self-contained HTML file (CSS, fonts, scripts inlined).
// Production deployments use the normal server build instead.
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dest = path.join(root, "preview");
const PORT = 4300;
const origin = `http://127.0.0.1:${PORT}`;
// Pages not linked from the menus but still reviewed.
const EXTRA_ROUTES = ["/clients-partners/"];

const env = { ...process.env, NEXT_PUBLIC_PREVIEW: "1", NEXT_DIST_DIR: ".next-preview" };
execSync("npx next build", { cwd: root, stdio: "inherit", env });
// Own process group, so stopping it also stops the next-server child (no orphans holding the port).
const server = spawn(path.join(root, "node_modules/.bin/next"), ["start", "-p", String(PORT), "-H", "127.0.0.1"], {
  cwd: root,
  env,
  stdio: "ignore",
  detached: true,
});

const assetCache = new Map();
async function fetchAsset(url) {
  if (!assetCache.has(url)) {
    const res = await fetch(new URL(url, origin));
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    assetCache.set(url, Buffer.from(await res.arrayBuffer()));
  }
  return assetCache.get(url);
}
const text = async (url) => (await fetchAsset(url)).toString("utf8");

// The host rejects a raw U+FFFD; the escape is equivalent inside JS and CSS strings.
const clean = (s) => s.replaceAll("�", "\\uFFFD");

async function inlineCss(href) {
  let css = await text(href);
  // Latin subset only: the site is English, and each preview page embeds its fonts.
  css = css.replace(/@font-face\{[^}]*unicode-range:[^}]*\}/g, (face) => (face.includes("U+0-FF") ? face : ""));
  const fonts = [...css.matchAll(/url\((\.\.\/media\/[^)]+\.woff2)\)/g)].map((m) => m[1]);
  for (const rel of new Set(fonts)) {
    const data = (await fetchAsset(new URL(rel, new URL(href, origin)).pathname)).toString("base64");
    css = css.replaceAll(`url(${rel})`, `url(data:font/woff2;base64,${data})`);
  }
  return `<style>${clean(css)}</style>`;
}

// Inlined scripts have no src, but Turbopack identifies chunks (and Next its
// asset prefix) from document.currentScript.src. Give each the path it had.
const CHUNK_HEADER = '"object"==typeof document?document.currentScript:void 0';
const ASSET_PREFIX = "let e=document.currentScript;if(!(e instanceof HTMLScriptElement))";

async function inlineScript(src, inlined) {
  inlined.add(src);
  let js = await text(src);
  js = js.replaceAll(CHUNK_HEADER, `{getAttribute:()=>${JSON.stringify(src)}}`);
  js = js.replaceAll(ASSET_PREFIX, `let e={src:location.origin+${JSON.stringify(src)}};if(!1)`);
  js = clean(js).replaceAll("</script", "<\\/script");
  return `<script>${js}</script>`;
}

// Async-aware replace that always uses a function replacer (library code contains
// "$'"-style sequences that a string replacement would expand).
async function replaceAsync(str, re, fn) {
  const parts = [];
  let last = 0;
  for (const m of str.matchAll(re)) {
    parts.push(str.slice(last, m.index), await fn(...m));
    last = m.index + m[0].length;
  }
  return parts.join("") + str.slice(last);
}

// Code loaded on demand (menu animation, form validation) is requested by path at runtime.
async function inlineLazyChunks(html, inlined) {
  let extra = "";
  for (;;) {
    const wanted = [...new Set((html + extra).match(/static\/chunks\/[\w.-]+\.js/g) ?? [])]
      .map((p) => `/_next/${p}`)
      .filter((src) => !inlined.has(src));
    if (wanted.length === 0) return html.replace("</body>", () => `${extra}</body>`);
    for (const src of wanted) extra += await inlineScript(src, inlined);
  }
}

// Pages are separate files on the host: internal links become relative file paths,
// and clicks bypass Next's client router (it would fetch data the host does not serve).
function toFile(href, prefix) {
  const [p, query] = href.split("?");
  const file = `${prefix}${p.replace(/^\//, "")}${p.endsWith("/") ? "" : "/"}index.html`;
  return query ? `${file}?${query}` : file;
}

function navScript(prefix) {
  return `<script>window.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a||a.target==="_blank"||e.metaKey||e.ctrlKey)return;var h=a.getAttribute("href");if(!h||h[0]==="#"||/^[a-z][a-z0-9+.-]*:|^\\/\\//i.test(h))return;e.preventDefault();e.stopImmediatePropagation();if(h[0]!=="/"){location.href=h;return}var q=h.split("?"),p=q[0].replace(/^\\//,"");location.href=${JSON.stringify(prefix)}+p+(p===""||/\\/$/.test(p)?"":"/")+"index.html"+(q[1]?"?"+q[1]:"")},true);</script>`;
}

const internal = (href) =>
  href.startsWith("/") && !href.startsWith("//") && !/^\/(_next|api|files)\//.test(href) && !href.startsWith("/icon");

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(origin)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Server did not start");
}

async function crawl() {
  const seen = new Set(["/", ...EXTRA_ROUTES]);
  const queue = [...seen];
  const pages = new Map();
  while (queue.length) {
    const route = queue.shift();
    const res = await fetch(origin + route);
    if (!res.ok) throw new Error(`${route}: HTTP ${res.status}`);
    const html = await res.text();
    pages.set(route, html);
    for (const [, href] of html.matchAll(/href="([^"#?]+)/g)) {
      if (internal(href) && href.endsWith("/") && !seen.has(href)) {
        seen.add(href);
        queue.push(href);
      }
    }
  }
  return pages;
}

async function packPage(route, source) {
  const inlined = new Set();
  const prefix = "../".repeat(route.split("/").filter(Boolean).length);
  let html = source.replace(/<head>/, () => `<head>${navScript(prefix)}`);
  html = html.replace(/<link rel="preload"[^>]*as="font"[^>]*\/>/g, () => "");
  html = await replaceAsync(html, /<link rel="stylesheet" href="([^"]+)"[^>]*\/>/g, (_, href) => inlineCss(href));
  html = await replaceAsync(html, /<link rel="preload" as="script"[^>]*href="([^"]+)"[^>]*\/>/g, (_, src) => inlineScript(src, inlined));
  html = html.replace(/<script src="[^"]+" noModule=""><\/script>/g, () => "");
  html = await replaceAsync(html, /<script src="([^"]+)" async=""><\/script>/g, (_, src) => inlineScript(src, inlined));
  html = await replaceAsync(html, /<link rel="icon" href="([^"]+)"[^>]*\/>/g, async (_, href) => {
    const svg = (await fetchAsset(href)).toString("base64");
    return `<link rel="icon" href="data:image/svg+xml;base64,${svg}" type="image/svg+xml"/>`;
  });
  html = html.replace(/href="(\/(?!\/|_next\/|icon)[^"#]*)"/g, (_, href) => `href="${toFile(href, prefix)}"`);
  html = await inlineLazyChunks(html, inlined);
  if (!html.includes("getAttribute:()=>")) throw new Error(`${route}: chunk header patch did not apply`);
  const leftovers = html.match(/(src|href)="\/_next[^"]*"/g);
  if (leftovers) throw new Error(`${route}: unresolved assets ${leftovers.join(", ")}`);
  return clean(html);
}

try {
  await waitForServer();
  const pages = await crawl();
  fs.rmSync(dest, { recursive: true, force: true });
  for (const [route, source] of pages) {
    const file = path.join(dest, route, "index.html");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, await packPage(route, source));
    console.log(`${route}: ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  }
  console.log(`${pages.size} pages`);
} finally {
  process.kill(-server.pid, "SIGTERM");
}
