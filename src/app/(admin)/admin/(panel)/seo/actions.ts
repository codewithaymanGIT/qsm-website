"use server";

import { rolesFor } from "@/components/admin/nav";
import { adminAction } from "@/lib/server/admin-action";
import { saveSeoEntry } from "@/lib/server/admin-content";

export async function saveSeoAction(path: string, form: FormData) {
  return adminAction(rolesFor("/admin/seo/"), async () => {
    await saveSeoEntry(path, form);
    return "Saved. Search engines pick this up on their next visit.";
  });
}
