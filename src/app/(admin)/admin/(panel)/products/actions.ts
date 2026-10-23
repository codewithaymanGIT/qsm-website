"use server";

import { redirect } from "next/navigation";
import { rolesFor } from "@/components/admin/nav";
import { adminAction, formFile } from "@/lib/server/admin-action";
import { AdminInputError, parseProductForm, saveProduct } from "@/lib/server/admin-content";
import { db } from "@/lib/server/db";
import { deleteMedia, storeMedia } from "@/lib/server/media";

const roles = rolesFor("/admin/products/");

export async function saveProductAction(id: string | null, form: FormData) {
  return adminAction(roles, async () => {
    const saved = await saveProduct(id, parseProductForm(form));
    if (!id) redirect(`/admin/products/${saved}/?created=1`);
    return "Saved. The website is updated.";
  });
}

export async function deleteProductAction(id: string) {
  return adminAction(roles, async () => {
    const downloads = await db.download.findMany({ where: { productId: id } });
    await db.product.delete({ where: { id } });
    await Promise.all(downloads.map((d) => deleteMedia(d.fileKey)));
    redirect("/admin/products/");
  });
}

/** Datasheets only: mill test certificates are confidential and shared on request. */
export async function uploadDatasheetAction(productId: string, form: FormData) {
  return adminAction(roles, async () => {
    const file = await formFile(form, "file");
    if (!file) throw new AdminInputError("Choose a PDF to upload.");
    const title = String(form.get("title") ?? "").trim() || "Datasheet";
    const stored = await storeMedia(file, "document");
    await db.download.create({
      data: {
        kind: "DATASHEET",
        title,
        productId,
        fileKey: stored.key,
        fileName: stored.fileName,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
      },
    });
    return "Datasheet uploaded.";
  });
}

export async function deleteDownloadAction(id: string) {
  return adminAction(roles, async () => {
    const d = await db.download.delete({ where: { id } });
    await deleteMedia(d.fileKey);
    return "Removed.";
  });
}
