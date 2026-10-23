// One-time creation of the first admin on a fresh deployment, unlocked by the
// ADMIN_SETUP_TOKEN environment variable. Closes for good once any user exists.
import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { AdminInputError } from "./admin-content";
import { db } from "./db";
import { overLimit } from "./rate-limit";
import { createUser } from "./users-admin";

export type SetupState = "open" | "done" | "disabled";

export async function setupState(): Promise<SetupState> {
  if ((await db.user.count()) > 0) return "done";
  return process.env.ADMIN_SETUP_TOKEN ? "open" : "disabled";
}

const digest = (s: string) => createHash("sha256").update(s).digest();

export async function createFirstAdmin(input: { name: string; email: string; password: string; token: string }, ip: string) {
  if ((await setupState()) !== "open") throw new AdminInputError("Setup is closed. Sign in instead.");
  if (await overLimit(`setup:${ip}`, 5, 15 * 60 * 1000)) throw new AdminInputError("Too many attempts. Wait 15 minutes.");
  if (!timingSafeEqual(digest(input.token), digest(process.env.ADMIN_SETUP_TOKEN!))) {
    throw new AdminInputError("The setup token is not correct.");
  }
  return createUser({ ...input, role: "ADMIN" });
}
