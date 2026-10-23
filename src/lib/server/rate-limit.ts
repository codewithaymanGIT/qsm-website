// Counts recent events per hashed key in the LoginAttempt table (a generic "keyHash + time" log).
import "server-only";
import { createHash } from "node:crypto";
import { db } from "./db";

/** Records one event for `key` and reports whether it went over `max` in the window. */
export async function overLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  const keyHash = createHash("sha256").update(`${process.env.IP_HASH_SALT ?? ""}:${key}`).digest("hex");
  const recent = await db.loginAttempt.count({ where: { keyHash, createdAt: { gte: new Date(Date.now() - windowMs) } } });
  if (recent >= max) return true;
  await db.loginAttempt.create({ data: { keyHash } });
  return false;
}
