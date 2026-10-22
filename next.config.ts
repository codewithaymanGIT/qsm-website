import type { NextConfig } from "next";

// Runs as a Node server (Docker-friendly standalone output). Pages are prerendered
// from the database at build time and refreshed on demand via cache tags.
const nextConfig: NextConfig = {
  output: "standalone",
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
