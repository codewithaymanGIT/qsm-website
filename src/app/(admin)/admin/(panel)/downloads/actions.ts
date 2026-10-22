"use server";

import { rolesFor } from "@/components/admin/nav";
import { adminAction, formFile } from "@/lib/server/admin-action";
import { addCertificate, deleteCertificate, removeBrochure, replaceBrochure } from "@/lib/server/media-admin";

const roles = rolesFor("/admin/downloads/");

export async function brochureAction(form: FormData) {
  return adminAction(roles, async () => {
    await replaceBrochure(form, formFile(form, "file"));
    return "Brochure uploaded.";
  });
}

export async function removeBrochureAction() {
  return adminAction(roles, async () => {
    await removeBrochure();
    return "Brochure removed.";
  });
}

export async function addCertificateAction(form: FormData) {
  return adminAction(roles, async () => {
    await addCertificate(form, formFile(form, "file"));
    return "Certificate added.";
  });
}

export async function deleteCertificateAction(id: string) {
  return adminAction(roles, async () => {
    await deleteCertificate(id);
    return "Deleted.";
  });
}
