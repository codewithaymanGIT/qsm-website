import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/server/db";
import { createFirstAdmin, setupState } from "@/lib/server/first-admin";

const input = { name: "Owner", email: "owner@example.com", password: "a-long-owner-password", token: "correct horse battery staple" };

beforeAll(async () => {
  await db.user.deleteMany();
  await db.loginAttempt.deleteMany();
});
afterAll(() => vi.unstubAllEnvs());

describe("first admin setup", () => {
  it("is off without a setup token", async () => {
    vi.stubEnv("ADMIN_SETUP_TOKEN", "");
    expect(await setupState()).toBe("disabled");
    await expect(createFirstAdmin(input, "203.0.113.1")).rejects.toThrow(/closed/);
  });

  it("rejects a wrong token, then creates the admin once and closes", async () => {
    vi.stubEnv("ADMIN_SETUP_TOKEN", input.token);
    expect(await setupState()).toBe("open");
    await expect(createFirstAdmin({ ...input, token: "wrong" }, "203.0.113.2")).rejects.toThrow(/not correct/);
    const user = await createFirstAdmin(input, "203.0.113.2");
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).role).toBe("ADMIN");
    expect(await setupState()).toBe("done");
    await expect(createFirstAdmin({ ...input, email: "second@example.com" }, "203.0.113.2")).rejects.toThrow(/closed/);
  });

  it("limits guessing", async () => {
    await db.user.deleteMany();
    vi.stubEnv("ADMIN_SETUP_TOKEN", input.token);
    for (let i = 0; i < 5; i++) await expect(createFirstAdmin({ ...input, token: `guess ${i}` }, "203.0.113.3")).rejects.toThrow(/not correct/);
    await expect(createFirstAdmin(input, "203.0.113.3")).rejects.toThrow(/Too many/);
  });
});
