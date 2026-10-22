// User management for admins. Callers must already have checked the ADMIN role.
import "server-only";
import type { Role } from "@/generated/prisma/client";
import { AdminInputError } from "./admin-content";
import { db } from "./db";
import { hashPassword } from "./password";

const MIN_PASSWORD = 12;
const ROLES: Role[] = ["ADMIN", "EDITOR", "SALES"];

function checkPassword(p: string) {
  if (p.length < MIN_PASSWORD) throw new AdminInputError(`Passwords need at least ${MIN_PASSWORD} characters.`);
}

export async function createUser(input: { email: string; name: string; role: Role; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AdminInputError("Enter a valid email address.");
  if (!input.name.trim()) throw new AdminInputError("Enter the person's name.");
  if (!ROLES.includes(input.role)) throw new AdminInputError("Choose a role.");
  checkPassword(input.password);
  if (await db.user.findUnique({ where: { email } })) throw new AdminInputError("A user with this email already exists.");
  return db.user.create({
    data: {
      email,
      name: input.name.trim(),
      role: input.role,
      passwordHash: await hashPassword(input.password),
    },
    select: { id: true, email: true },
  });
}

/** Role and active changes, with lock-out protection. */
export async function updateUser(id: string, change: { role: Role; active: boolean }, actorId: string) {
  if (!ROLES.includes(change.role)) throw new AdminInputError("Choose a role.");
  const user = await db.user.findUniqueOrThrow({ where: { id } });
  if (id === actorId && (change.role !== "ADMIN" || !change.active)) {
    throw new AdminInputError("You cannot remove your own admin access. Ask another admin.");
  }
  const losingAdmin = user.role === "ADMIN" && user.active && (change.role !== "ADMIN" || !change.active);
  if (losingAdmin && (await db.user.count({ where: { role: "ADMIN", active: true } })) <= 1) {
    throw new AdminInputError("This is the last active admin. Make someone else an admin first.");
  }
  await db.user.update({ where: { id }, data: change });
  if (!change.active) await db.session.deleteMany({ where: { userId: id } });
}

export async function resetPassword(id: string, password: string) {
  checkPassword(password);
  await db.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(password) },
  });
  await db.session.deleteMany({ where: { userId: id } });
}

export const listUsers = () =>
  db.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      lastLoginAt: true,
    },
  });
