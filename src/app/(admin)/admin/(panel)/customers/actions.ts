"use server";

import { rolesFor } from "@/components/admin/nav";
import { adminAction, formFile } from "@/lib/server/admin-action";
import { addCustomer, deleteCustomer, updateCustomer } from "@/lib/server/media-admin";

const roles = rolesFor("/admin/customers/");

export async function addCustomerAction(form: FormData) {
  return adminAction(roles, async () => {
    await addCustomer(form, formFile(form, "file"));
    return "Customer added.";
  });
}

export async function updateCustomerAction(id: string, form: FormData) {
  return adminAction(roles, () => updateCustomer(id, form, formFile(form, "file")));
}

export async function deleteCustomerAction(id: string) {
  return adminAction(roles, async () => {
    await deleteCustomer(id);
    return "Deleted.";
  });
}
