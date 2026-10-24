"use server";

import { rolesFor } from "@/components/admin/nav";
import { adminAction, formFile } from "@/lib/server/admin-action";
import { saveService } from "@/lib/server/admin-content";
import { setServicePhotos } from "@/lib/server/media-admin";

export async function saveServiceAction(id: string, form: FormData) {
  return adminAction(rolesFor("/admin/services/"), async () => {
    await saveService(id, form);
    await setServicePhotos(id, [
      { file: await formFile(form, "photo1"), remove: form.get("removePhoto1") === "on" },
      { file: await formFile(form, "photo2"), remove: form.get("removePhoto2") === "on" },
    ]);
    return "Saved. The website is updated.";
  });
}
