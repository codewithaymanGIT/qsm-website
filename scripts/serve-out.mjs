// Serves out/ with gzip, like production hosting, for local Lighthouse runs.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "../out");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain" };
const port = Number(process.argv[2] ?? 4174);

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file)) return res.writeHead(404).end();
    const ext = path.extname(file);
    const body = fs.readFileSync(file);
    const headers = { "content-type": types[ext] ?? "application/octet-stream" };
    if (p.includes("/_next/static/")) headers["cache-control"] = "public, max-age=31536000, immutable";
    if (/gzip/.test(req.headers["accept-encoding"] ?? "") && ext !== ".woff2") {
      headers["content-encoding"] = "gzip";
      return res.writeHead(200, headers).end(zlib.gzipSync(body));
    }
    res.writeHead(200, headers).end(body);
  })
  .listen(port, "127.0.0.1");
