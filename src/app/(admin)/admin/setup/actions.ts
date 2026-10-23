"use server";

import { redirect } from "next/navigation";
import { AdminInputError } from "@/lib/server/admin-content";
import { clientIp, startSession } from "@/lib/server/auth";
import { createFirstAdmin } from "@/lib/server/first-admin";

export type SetupFormState = { error: string | null };

export async function setUp(_prev: SetupFormState, form: FormData): Promise<SetupFormState> {
  const str = (k: string) => String(form.get(k) ?? "");
  let userId: string;
  try {
    const user = await createFirstAdmin({ name: str("name"), email: str("email"), password: str("password"), token: str("token") }, await clientIp());
    userId = user.id;
  } catch (e) {
    if (e instanceof AdminInputError) return { error: e.message };
    throw e;
  }
  await startSession(userId);
  redirect("/admin/");
}
