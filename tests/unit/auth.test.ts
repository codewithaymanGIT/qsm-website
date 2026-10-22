import { describe, expect, it } from "vitest";
import { db } from "@/lib/server/db";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { authenticate, createSession, deleteSession, findSessionUser, LOGIN_LIMIT, SIGN_IN_ERROR } from "@/lib/server/auth-core";

async function makeUser(email: string, password = "correct horse battery", extra: object = {}) {
  return db.user.create({ data: { email, name: "Test", passwordHash: await hashPassword(password), role: "SALES", ...extra } });
}

describe("passwords", () => {
  it("hashes with a salt and verifies", async () => {
    const a = await hashPassword("s3cret-password!");
    const b = await hashPassword("s3cret-password!");
    expect(a).not.toBe(b);
    expect(a.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("s3cret-password!", a)).toBe(true);
    expect(await verifyPassword("wrong", a)).toBe(false);
    expect(await verifyPassword("x", "garbage")).toBe(false);
  });
});

describe("authenticate", () => {
  it("signs in with the right password and records the time", async () => {
    const u = await makeUser("ok@example.com");
    const r = await authenticate("OK@example.com ", "correct horse battery", "1.1.1.1");
    expect(r).toEqual({ ok: true, userId: u.id });
    expect((await db.user.findUniqueOrThrow({ where: { id: u.id } })).lastLoginAt).not.toBeNull();
  });

  it("gives the same error for a wrong password and an unknown email", async () => {
    await makeUser("same@example.com");
    expect(await authenticate("same@example.com", "nope", "1.1.1.2")).toEqual({ ok: false, error: SIGN_IN_ERROR });
    expect(await authenticate("nobody@example.com", "nope", "1.1.1.2")).toEqual({ ok: false, error: SIGN_IN_ERROR });
  });

  it("rejects deactivated users", async () => {
    await makeUser("off@example.com", "correct horse battery", { active: false });
    expect((await authenticate("off@example.com", "correct horse battery", "1.1.1.3")).ok).toBe(false);
  });

  it("blocks after too many failures, even with the right password", async () => {
    await makeUser("brute@example.com");
    for (let i = 0; i < LOGIN_LIMIT.max; i++) await authenticate("brute@example.com", "wrong", "6.6.6.6");
    const r = await authenticate("brute@example.com", "correct horse battery", "6.6.6.6");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Too many attempts/);
  });
});

describe("sessions", () => {
  it("stores only a hash of the token and resolves the user", async () => {
    const u = await makeUser("sess@example.com");
    const token = await createSession(u.id);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await db.session.count({ where: { tokenHash: token } })).toBe(0);
    expect((await findSessionUser(token))?.id).toBe(u.id);
    await deleteSession(token);
    expect(await findSessionUser(token)).toBeNull();
  });

  it("rejects expired sessions and deactivated users", async () => {
    const u = await makeUser("exp@example.com");
    const token = await createSession(u.id);
    await db.session.updateMany({ where: { userId: u.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await findSessionUser(token)).toBeNull();
    const token2 = await createSession(u.id);
    await db.user.update({ where: { id: u.id }, data: { active: false } });
    expect(await findSessionUser(token2)).toBeNull();
  });
});
