"use server";

import { rolesFor } from "@/components/admin/nav";
import type { Role } from "@/generated/prisma/client";
import { adminAction } from "@/lib/server/admin-action";
import { createUser, resetPassword, updateUser } from "@/lib/server/users-admin";

const roles = rolesFor("/admin/users/");
const str = (form: FormData, k: string) => String(form.get(k) ?? "");

export async function createUserAction(form: FormData) {
  return adminAction(
    roles,
    async () => {
      const u = await createUser({
        email: str(form, "email"),
        name: str(form, "name"),
        role: str(form, "role") as Role,
        password: str(form, "password"),
      });
      return `Created ${u.email}. Send them the password privately (WhatsApp or phone, not email).`;
    },
    { refreshSite: false },
  );
}

export async function updateUserAction(id: string, form: FormData) {
  return adminAction(
    roles,
    (actor) =>
      updateUser(
        id,
        {
          role: str(form, "role") as Role,
          active: form.get("active") === "on",
        },
        actor.id,
      ),
    { refreshSite: false },
  );
}

export async function resetPasswordAction(id: string, form: FormData) {
  return adminAction(
    roles,
    async () => {
      await resetPassword(id, str(form, "password"));
      return "Password changed. They have been signed out everywhere.";
    },
    { refreshSite: false },
  );
}
