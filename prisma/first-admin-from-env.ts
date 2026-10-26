// Deploy step: makes sure ADMIN_EMAIL + ADMIN_PASSWORD (set in the hosting settings) is an active
// admin who can sign in with that password. Creates the account, or promotes and resets an existing one.
// Remove ADMIN_PASSWORD from the hosting settings once signed in; later deploys then leave users alone.
import type { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword, verifyPassword } from "../src/lib/server/password";

export async function createAdminFromEnv(db: PrismaClient, env: Record<string, string | undefined> = process.env) {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD?.trim();
  if (!email || !password) return "skipped: ADMIN_EMAIL / ADMIN_PASSWORD not set";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("ADMIN_EMAIL is not a valid email address.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  const existing = await db.user.findUnique({ where: { email } });
  if (!existing) {
    await db.user.create({ data: { email, name: env.ADMIN_NAME?.trim() || "Owner", role: "ADMIN", passwordHash: await hashPassword(password) } });
    return `created admin ${email}`;
  }
  const samePassword = await verifyPassword(password, existing.passwordHash);
  await db.user.update({
    where: { id: existing.id },
    data: { role: "ADMIN", active: true, ...(samePassword ? {} : { passwordHash: await hashPassword(password) }) },
  });
  // A new password ends old sessions, as a reset in the admin panel does.
  if (!samePassword) await db.session.deleteMany({ where: { userId: existing.id } });
  return `updated admin ${email}`;
}
