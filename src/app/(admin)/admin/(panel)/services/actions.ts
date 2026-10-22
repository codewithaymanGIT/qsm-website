"use server";

import { rolesFor } from "@/components/admin/nav";
import { adminAction } from "@/lib/server/admin-action";
import { saveService } from "@/lib/server/admin-content";

export async function saveServiceAction(id: string, form: FormData) {
  return adminAction(rolesFor("/admin/services/"), async () => {
    await saveService(id, form);
    return "Saved. The website is updated.";
  });
}
