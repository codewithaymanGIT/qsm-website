// Creates the admin test users in the throwaway test database before browser tests.
import { Client } from "pg";
import { hashPassword } from "../../src/lib/server/password";

export const E2E_DB = process.env.E2E_DATABASE_URL ?? "postgresql://qsm:qsm_dev_password@127.0.0.1:5432/qsm_test";
export const USERS = {
  admin: { email: "admin@example.com", password: "admin-test-password-1", role: "ADMIN", name: "Test Admin" },
  sales: { email: "sales@example.com", password: "sales-test-password-1", role: "SALES", name: "Test Sales" },
} as const;

export default async function globalSetup() {
  if (!new URL(E2E_DB).pathname.endsWith("_test")) throw new Error("E2E must use a *_test database");
  const client = new Client({ connectionString: E2E_DB });
  await client.connect();
  try {
    await client.query(`DELETE FROM "LoginAttempt"`);
    for (const u of Object.values(USERS)) {
      await client.query(
        `INSERT INTO "User" (id, email, name, "passwordHash", role, active, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5::"Role", true, now(), now())
         ON CONFLICT (email) DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, active = true`,
        [`e2e-${u.role.toLowerCase()}`, u.email, u.name, await hashPassword(u.password), u.role],
      );
    }
  } finally {
    await client.end();
  }
}
