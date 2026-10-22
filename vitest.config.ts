import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // "server-only" throws outside React Server Components; tests run server code directly.
      "server-only": path.resolve(__dirname, "tests/setup/empty.ts"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    globalSetup: ["tests/setup/global.ts"],
    setupFiles: ["tests/setup/next-cache.ts"],
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgresql://qsm:qsm_dev_password@127.0.0.1:5432/qsm_test",
      UPLOAD_DIR: path.resolve(__dirname, "storage/test-uploads"),
      IP_HASH_SALT: "test-salt",
    },
    // Integration tests share one database; run files one at a time.
    fileParallelism: false,
  },
});
