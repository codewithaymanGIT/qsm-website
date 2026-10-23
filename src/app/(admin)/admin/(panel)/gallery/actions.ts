"use server";

import { rolesFor } from "@/components/admin/nav";
import { adminAction, formFile } from "@/lib/server/admin-action";
import { addGalleryItem, deleteGalleryItem, updateGalleryItem } from "@/lib/server/media-admin";

const roles = rolesFor("/admin/gallery/");

export async function addGalleryAction(form: FormData) {
  return adminAction(roles, async () => {
    await addGalleryItem(form, await formFile(form, "file"));
    return "Photo added to the website.";
  });
}

export async function updateGalleryAction(id: string, form: FormData) {
  return adminAction(roles, async () => updateGalleryItem(id, form, await formFile(form, "file")));
}

export async function deleteGalleryAction(id: string) {
  return adminAction(roles, async () => {
    await deleteGalleryItem(id);
    return "Deleted.";
  });
}
