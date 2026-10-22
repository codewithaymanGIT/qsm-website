import type { NextConfig } from "next";

// Phase 1 is a static export for client review. Phase 2 (database, admin,
// uploads) removes `output: "export"` and re-enables server features.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
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
