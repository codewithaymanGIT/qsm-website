import { describe, expect, it } from "vitest";
import { db } from "@/lib/server/db";
import { createSession, findSessionUser } from "@/lib/server/auth-core";
import { createUser, resetPassword, updateUser } from "@/lib/server/users-admin";
import { verifyPassword } from "@/lib/server/password";

let n = 0;
const email = () => `user${++n}-${Date.now()}@example.com`;

describe("users", () => {
  it("creates a user with a hashed password and normalised email", async () => {
    const u = await createUser({
      email: `  NEW${email()}`,
      name: "Neha",
      role: "EDITOR",
      password: "long-enough-pass",
    });
    expect(u.email).toBe(u.email.toLowerCase().trim());
    const row = await db.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(await verifyPassword("long-enough-pass", row.passwordHash)).toBe(true);
  });

  it("refuses short passwords and duplicate emails", async () => {
    await expect(
      createUser({
        email: email(),
        name: "X",
        role: "SALES",
        password: "short",
      }),
    ).rejects.toThrow(/12 characters/);
    const e = email();
    await createUser({
      email: e,
      name: "A",
      role: "SALES",
      password: "long-enough-pass",
    });
    await expect(
      createUser({
        email: e,
        name: "B",
        role: "SALES",
        password: "long-enough-pass",
      }),
    ).rejects.toThrow(/already/);
  });

  it("stops admins from locking themselves out", async () => {
    const admin = await createUser({
      email: email(),
      name: "Boss",
      role: "ADMIN",
      password: "long-enough-pass",
    });
    await expect(updateUser(admin.id, { role: "SALES", active: true }, admin.id)).rejects.toThrow(/your own/);
    await expect(updateUser(admin.id, { role: "ADMIN", active: false }, admin.id)).rejects.toThrow(/your own/);
  });

  it("always keeps at least one active admin", async () => {
    await db.user.updateMany({
      where: { role: "ADMIN" },
      data: { active: false },
    });
    const only = await createUser({
      email: email(),
      name: "Only",
      role: "ADMIN",
      password: "long-enough-pass",
    });
    const other = await createUser({
      email: email(),
      name: "Other",
      role: "ADMIN",
      password: "long-enough-pass",
    });
    await updateUser(other.id, { role: "EDITOR", active: true }, only.id);
    const third = await createUser({
      email: email(),
      name: "Third",
      role: "EDITOR",
      password: "long-enough-pass",
    });
    await expect(updateUser(only.id, { role: "EDITOR", active: true }, third.id)).rejects.toThrow(/last active admin/);
  });

  it("signs a user out everywhere when deactivated or given a new password", async () => {
    const u = await createUser({
      email: email(),
      name: "S",
      role: "SALES",
      password: "long-enough-pass",
    });
    const admin = await createUser({
      email: email(),
      name: "A",
      role: "ADMIN",
      password: "long-enough-pass",
    });
    const t1 = await createSession(u.id);
    await resetPassword(u.id, "another-long-pass");
    expect(await findSessionUser(t1)).toBeNull();
    const t2 = await createSession(u.id);
    await updateUser(u.id, { role: "SALES", active: false }, admin.id);
    expect(await findSessionUser(t2)).toBeNull();
  });
});
