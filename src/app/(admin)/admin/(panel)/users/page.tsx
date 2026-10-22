import { Suspense } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { rolesFor } from "@/components/admin/nav";
import { adminInput, card, Checkbox, Field, Loading, PageTitle } from "@/components/admin/ui";
import type { Role } from "@/generated/prisma/client";
import { requireUser, ROLE_LABEL } from "@/lib/server/auth";
import { listUsers } from "@/lib/server/users-admin";
import { createUserAction, resetPasswordAction, updateUserAction } from "./actions";

export default function UsersPage() {
  return (
    <>
      <PageTitle title="Users" />
      <dl className="-mt-4 mb-8 grid max-w-3xl gap-x-6 gap-y-1 text-sm text-mist sm:grid-cols-[6rem_minmax(0,1fr)]">
        <dt className="text-surface">Admin</dt>
        <dd>Everything, including users.</dd>
        <dt className="text-surface">Editor</dt>
        <dd>Website content and SEO; can read enquiries.</dd>
        <dt className="text-surface">Sales</dt>
        <dd>Enquiries only.</dd>
      </dl>
      <Suspense fallback={<Loading />}>
        <Users />
      </Suspense>
    </>
  );
}

const ROLES: Role[] = ["ADMIN", "EDITOR", "SALES"];
const fmt = (d: Date | null) =>
  d
    ? d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Never";

function RoleSelect({ idPrefix, value }: { idPrefix: string; value?: Role }) {
  return (
    <div className="min-w-0">
      <label htmlFor={`${idPrefix}-role`} className="mb-1.5 block text-sm text-surface/80">
        Role
      </label>
      <select id={`${idPrefix}-role`} name="role" defaultValue={value ?? "SALES"} className={adminInput}>
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </select>
    </div>
  );
}

async function Users() {
  const me = await requireUser(rolesFor("/admin/users/"));
  const users = await listUsers();
  return (
    <div className="space-y-6">
      {users.map((u) => (
        <section key={u.id} aria-label={u.name} className={`${card} p-6`}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">
              {u.name} {u.id === me.id && <span className="text-sm font-normal text-mist">(you)</span>}
            </h2>
            <p className="text-sm text-mist">
              {u.email} · last sign-in {fmt(u.lastLoginAt)}
            </p>
          </div>
          <ActionForm action={updateUserAction.bind(null, u.id)} className="flex flex-wrap items-end gap-5">
            <div className="w-44">
              <RoleSelect idPrefix={`u${u.id}`} value={u.role} />
            </div>
            <Checkbox label="Can sign in" name="active" defaultChecked={u.active} />
          </ActionForm>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-mist">Set a new password</summary>
            <ActionForm action={resetPasswordAction.bind(null, u.id)} submitLabel="Set password" resetOnSuccess className="mt-3 max-w-sm">
              <Field idPrefix={`u${u.id}`} label="New password" name="password" type="password" hint="At least 12 characters." required />
            </ActionForm>
          </details>
        </section>
      ))}
      <section aria-labelledby="add-user" className={`${card} border-dashed p-6`}>
        <h2 id="add-user" className="mb-4 font-display text-lg font-semibold">
          Add a user
        </h2>
        <ActionForm action={createUserAction} submitLabel="Create user" resetOnSuccess className="grid gap-4 md:grid-cols-2">
          <Field idPrefix="new-user" label="Name" name="name" required />
          <Field idPrefix="new-user" label="Email" name="email" type="email" required />
          <RoleSelect idPrefix="new-user" />
          <Field
            idPrefix="new-user"
            label="Temporary password"
            name="password"
            type="password"
            hint="At least 12 characters. They can't change it themselves yet, so an admin sets new ones here."
            required
          />
        </ActionForm>
      </section>
    </div>
  );
}
