"use server";

import { rolesFor } from "@/components/admin/nav";
import { adminAction, formFile } from "@/lib/server/admin-action";
import { deleteCategory, saveCategory } from "@/lib/server/admin-content";
import { deleteMedia } from "@/lib/server/media";
import { setCategoryPhoto } from "@/lib/server/media-admin";

const roles = rolesFor("/admin/categories/");

export async function saveCategoryAction(id: string | null, form: FormData) {
  return adminAction(roles, async () => {
    const saved = await saveCategory(id, form);
    await setCategoryPhoto(saved.id, await formFile(form, "file"), form.get("removePhoto") === "on");
    return id ? "Saved." : "Category added.";
  });
}

export async function deleteCategoryAction(id: string) {
  return adminAction(roles, async () => {
    const key = await deleteCategory(id);
    await deleteMedia(key);
    return "Deleted.";
  });
}
