// Request-aware auth for admin pages, Server Actions and route handlers.
// Every admin entry point calls requireUser(); the proxy redirect is only a convenience.
import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";
import { createSession, deleteSession, findSessionUser, SESSION_DAYS, type SessionUser } from "./auth-core";

export const SESSION_COOKIE = "qsm_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? findSessionUser(token) : null;
}

/** Signed-in user with one of the roles, or a redirect (to sign in, or to the dashboard if not allowed). */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login/");
  if (roles && !roles.includes(user.role)) redirect("/admin/?denied=1");
  return user;
}

export async function startSession(userId: string) {
  const token = await createSession(userId);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  jar.delete(SESSION_COOKIE);
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export const ROLE_LABEL: Record<Role, string> = { ADMIN: "Admin", EDITOR: "Editor", SALES: "Sales" };
