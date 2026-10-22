// Prepares the throwaway test database before the unit/integration run:
// applies migrations (non-destructive), then empties and re-seeds it.
import { execSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { seed } from "../../prisma/seed";

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://qsm:qsm_dev_password@127.0.0.1:5432/qsm_test";

/** Refuse anything that is not a local database whose name ends in "_test". */
export function assertDisposableTestDatabase(url: string) {
  const u = new URL(url);
  const local = ["127.0.0.1", "localhost"].includes(u.hostname);
  if (!local || !u.pathname.endsWith("_test")) {
    throw new Error(`Refusing to clear ${u.hostname}${u.pathname}: tests only run against a local *_test database.`);
  }
}

export default async function setup() {
  assertDisposableTestDatabase(TEST_DATABASE_URL);
  execSync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }, stdio: "pipe" });
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: TEST_DATABASE_URL }) });
  try {
    const tables = await db.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
    const list = tables.map((t) => `"public"."${t.tablename}"`).join(", ");
    await db.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
    await db.$executeRawUnsafe(`ALTER SEQUENCE lead_reference_seq RESTART WITH 1`);
    await seed(db);
  } finally {
    await db.$disconnect();
  }
}
