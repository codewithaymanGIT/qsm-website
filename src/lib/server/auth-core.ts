// Sign-in and session logic without request APIs, so it can be tested directly.
// src/lib/server/auth.ts wraps it with cookies and redirects.
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { Role } from "@/generated/prisma/client";
import { db } from "./db";
import { hashPassword, verifyPassword } from "./password";

export const SESSION_DAYS = 7;
export const LOGIN_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };
export const SIGN_IN_ERROR = "Email or password is incorrect.";
const TOO_MANY = "Too many attempts. Wait 15 minutes and try again.";

export type SessionUser = { id: string; name: string; email: string; role: Role };

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const normalise = (email: string) => email.trim().toLowerCase();

// Spent on unknown emails too, so response time does not reveal which emails exist.
let dummyHash: Promise<string> | null = null;

export async function authenticate(
  email: string,
  password: string,
  ip: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const keyHash = sha256(`${process.env.IP_HASH_SALT ?? ""}:${normalise(email)}:${ip}`);
  const recentFailures = await db.loginAttempt.count({
    where: { keyHash, createdAt: { gte: new Date(Date.now() - LOGIN_LIMIT.windowMs) } },
  });
  if (recentFailures >= LOGIN_LIMIT.max) return { ok: false, error: TOO_MANY };

  const user = await db.user.findUnique({ where: { email: normalise(email) } });
  dummyHash ??= hashPassword("not-a-real-password");
  const valid = await verifyPassword(password, user?.passwordHash ?? (await dummyHash));
  if (!user || !valid || !user.active) {
    await db.loginAttempt.create({ data: { keyHash } });
    return { ok: false, error: SIGN_IN_ERROR };
  }
  await db.loginAttempt.deleteMany({ where: { keyHash } });
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { ok: true, userId: user.id };
}

/** A new random token on every sign-in (no session fixation). Returns the token for the cookie. */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await db.session.create({
    data: { tokenHash: sha256(token), userId, expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) },
  });
  return token;
}

export async function findSessionUser(token: string): Promise<SessionUser | null> {
  const session = await db.session.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!session || session.expiresAt < new Date() || !session.user.active) return null;
  // Rolling expiry, refreshed at most once a day.
  if (Date.now() - session.lastUsedAt.getTime() > 86_400_000) {
    await db.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date(), expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) },
    });
  }
  const { id, name, email, role } = session.user;
  return { id, name, email, role };
}

export async function deleteSession(token: string) {
  await db.session.deleteMany({ where: { tokenHash: sha256(token) } });
}
