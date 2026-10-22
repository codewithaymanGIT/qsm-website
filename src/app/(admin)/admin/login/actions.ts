"use server";

import { redirect } from "next/navigation";
import { authenticate } from "@/lib/server/auth-core";
import { clientIp, startSession } from "@/lib/server/auth";

export type SignInState = { error: string | null };

/** Only same-site admin paths are allowed as the post-login destination. */
const safeNext = (next: unknown) =>
  typeof next === "string" && /^\/admin(\/[\w\-/]*)?$/.test(next) && !next.startsWith("/admin/login") ? next : "/admin/";

export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const result = await authenticate(email, password, await clientIp());
  if (!result.ok) return { error: result.error };
  await startSession(result.userId);
  redirect(safeNext(form.get("next")));
}
