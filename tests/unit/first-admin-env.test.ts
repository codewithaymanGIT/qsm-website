import { beforeEach, describe, expect, it } from "vitest";
import { createAdminFromEnv } from "../../prisma/first-admin-from-env";
import { db } from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth-core";

beforeEach(async () => {
  await db.user.deleteMany();
  await db.loginAttempt.deleteMany();
});

describe("first admin from ADMIN_EMAIL / ADMIN_PASSWORD", () => {
  it("creates an admin who can sign in, only when there are no users", async () => {
    const env = { ADMIN_EMAIL: " Owner@Example.com ", ADMIN_PASSWORD: "steel-since-2002", ADMIN_NAME: "Hemant Bansal" };
    expect(await createAdminFromEnv(db, env)).toBe("created admin owner@example.com");
    expect(await createAdminFromEnv(db, { ...env, ADMIN_EMAIL: "other@example.com" })).toBe("skipped: users already exist");
    const user = await db.user.findUniqueOrThrow({ where: { email: "owner@example.com" } });
    expect(user).toMatchObject({ role: "ADMIN", name: "Hemant Bansal" });
    expect((await authenticate("owner@example.com", "steel-since-2002", "203.0.113.9")).ok).toBe(true);
  });

  it("does nothing without both variables, and rejects a short password", async () => {
    expect(await createAdminFromEnv(db, { ADMIN_EMAIL: "a@b.co" })).toMatch(/skipped/);
    await expect(createAdminFromEnv(db, { ADMIN_EMAIL: "a@b.co", ADMIN_PASSWORD: "short" })).rejects.toThrow(/12 characters/);
    expect(await db.user.count()).toBe(0);
  });
});
