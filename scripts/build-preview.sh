#!/usr/bin/env bash
# Builds the static export for the private review link. The preview host
# rejects top-level paths starting with "_", so Next's _next/ folder is moved
# under assets/ (matching PREVIEW_ASSET_PREFIX) and RSC prefetch files are
# dropped (navigation then falls back to normal page loads).
set -euo pipefail
cd "$(dirname "$0")/.."
PREVIEW_ASSET_PREFIX=/assets npx next build
mkdir -p out/assets
mv out/_next out/assets/_next
find out -maxdepth 1 -name '__next*' -delete
find out -name '__next*.txt' -delete
rm -rf out/_not-found
# The preview host rejects a literal U+FFFD; the JS escape is equivalent.
node -e '
const fs = require("fs"), path = require("path");
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".js")) {
      const s = fs.readFileSync(p, "utf8");
      if (s.includes("\uFFFD")) fs.writeFileSync(p, s.split("\uFFFD").join("\\uFFFD"));
    }
  }
})("out/assets");
'
node -e '
const fs = require("fs"), path = require("path");
const files = {};
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else { const rel = path.relative("out", p); if (rel !== "index.html") files[rel] = rel; }
  }
})("out");
fs.writeFileSync("preview-files.json", JSON.stringify(files));
console.log(Object.keys(files).length + " files");
'
