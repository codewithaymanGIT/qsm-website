"use server";

import { redirect } from "next/navigation";
import { endSession } from "@/lib/server/auth";

export async function signOut() {
  await endSession();
  redirect("/admin/login/");
}
