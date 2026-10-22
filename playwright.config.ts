import { defineConfig, devices } from "@playwright/test";

// Tests run against the production server (run `npm run build` first).
export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://127.0.0.1:4173" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx next start -p 4173 -H 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
