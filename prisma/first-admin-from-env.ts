// Deploy step: creates the first admin from ADMIN_EMAIL + ADMIN_PASSWORD (set once in the
// hosting settings) when the site has no users yet. Does nothing once any user exists.
import type { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/server/password";

export async function createAdminFromEnv(db: PrismaClient, env: Record<string, string | undefined> = process.env) {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD?.trim();
  if (!email || !password) return "skipped: ADMIN_EMAIL / ADMIN_PASSWORD not set";
  if ((await db.user.count()) > 0) return "skipped: users already exist";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("ADMIN_EMAIL is not a valid email address.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  await db.user.create({ data: { email, name: env.ADMIN_NAME?.trim() || "Owner", role: "ADMIN", passwordHash: await hashPassword(password) } });
  return `created admin ${email}`;
}
