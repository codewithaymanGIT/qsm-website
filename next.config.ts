import type { NextConfig } from "next";

// Runs as a Node server (Docker-friendly standalone output). Pages are prerendered
// from the database at build time and refreshed on demand via cache tags.
const nextConfig: NextConfig = {
  output: "standalone",
  // The review-link build (scripts/build-preview.mjs) uses its own folder so it never replaces the real build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  trailingSlash: true,
  cacheComponents: true,
  experimental: {
    // Admin uploads: PDFs up to 20 MB travel through Server Actions and the /admin proxy.
    serverActions: { bodySizeLimit: "21mb" },
    proxyClientMaxBodySize: "21mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
