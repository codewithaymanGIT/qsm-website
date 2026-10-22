import { defineConfig, devices } from "@playwright/test";

// Tests run against the production server (run `npm run build` first).
export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  use: { baseURL: "http://127.0.0.1:4173" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx next start -p 4173 -H 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    // Enquiries go to the throwaway test database; email is built but not sent.
    env: {
      DATABASE_URL: process.env.E2E_DATABASE_URL ?? "postgresql://qsm:qsm_dev_password@127.0.0.1:5432/qsm_test",
      UPLOAD_DIR: "storage/e2e-uploads",
      MEDIA_DIR: "storage/e2e-media",
      SMTP_URL: "json://",
      LEAD_NOTIFY_TO: "sales@example.com",
    },
  },
});
