import type { NextConfig } from "next";

// Runs as a Node server (Docker-friendly standalone output). Pages are prerendered
// from the database at build time and refreshed on demand via cache tags.
const nextConfig: NextConfig = {
  output: "standalone",
  // The review-link build (scripts/build-preview.mjs) uses its own folder so it never replaces the real build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  trailingSlash: true,
  cacheComponents: true,
  partialPrefetching: true,
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
