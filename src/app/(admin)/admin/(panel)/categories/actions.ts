"use server";

import { rolesFor } from "@/components/admin/nav";
import { adminAction } from "@/lib/server/admin-action";
import { deleteCategory, saveCategory } from "@/lib/server/admin-content";

const roles = rolesFor("/admin/categories/");

export async function saveCategoryAction(id: string | null, form: FormData) {
  return adminAction(roles, async () => {
    await saveCategory(id, form);
    return id ? "Saved." : "Category added.";
  });
}

export async function deleteCategoryAction(id: string) {
  return adminAction(roles, async () => {
    await deleteCategory(id);
    return "Deleted.";
  });
}
