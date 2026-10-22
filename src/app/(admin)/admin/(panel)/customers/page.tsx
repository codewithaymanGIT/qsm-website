import { Suspense } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { rolesFor } from "@/components/admin/nav";
import { card, Checkbox, ConfirmTick, dangerButton, Field, FileField, IMAGE_ACCEPT, Loading, PageTitle } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { addCustomerAction, deleteCustomerAction, updateCustomerAction } from "./actions";

export default function CustomersPage() {
  return (
    <>
      <PageTitle title="Customers" />
      <p className="-mt-4 mb-8 max-w-2xl text-mist">
        Logos shown under “Companies we have supplied”. Only list companies you have actually supplied. PNG with a transparent or white background
        works best (JPG, PNG or WEBP, up to 8 MB). Without a logo, the name is shown instead.
      </p>
      <Suspense fallback={<Loading />}>
        <Customers />
      </Suspense>
    </>
  );
}

const logoSrc = (key: string) => (key.startsWith("/") ? key : `/files/${key}`);

async function Customers() {
  await requireUser(rolesFor("/admin/customers/"));
  const rows = await db.partnerLogo.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      {rows.map((c) => (
        <section key={c.id} aria-label={c.name} className={`${card} grid gap-6 p-6 md:grid-cols-[180px_minmax(0,1fr)]`}>
          <div className="flex h-24 w-full max-w-[180px] items-center justify-center bg-white p-3">
            {c.imageKey && (c.published || c.imageKey.startsWith("/")) ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
              <img src={logoSrc(c.imageKey)} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-center text-sm text-ink">{c.imageKey ? "Hidden" : c.name}</span>
            )}
          </div>
          <div className="min-w-0">
            <ActionForm action={updateCustomerAction.bind(null, c.id)} className="grid gap-4 md:grid-cols-2">
              <Field idPrefix={`p${c.id}`} label="Company name" name="name" defaultValue={c.name} required />
              <FileField idPrefix={`p${c.id}`} label={c.imageKey ? "Replace logo" : "Upload logo"} accept={IMAGE_ACCEPT} />
              <Field idPrefix={`p${c.id}`} label="Website (optional)" name="website" defaultValue={c.website} hint="https://…" />
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-24">
                  <Field idPrefix={`p${c.id}`} label="Order" name="order" type="number" defaultValue={c.order} />
                </div>
                <Checkbox label="Show on the website" name="published" defaultChecked={c.published} />
              </div>
            </ActionForm>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-mist">Delete</summary>
              <ActionForm action={deleteCustomerAction.bind(null, c.id)} submitLabel={`Delete ${c.name}`} submitClassName={dangerButton}>
                <ConfirmTick />
              </ActionForm>
            </details>
          </div>
        </section>
      ))}
      <section aria-labelledby="add-customer" className={`${card} border-dashed p-6`}>
        <h2 id="add-customer" className="mb-4 font-display text-lg font-semibold">
          Add a customer
        </h2>
        <ActionForm action={addCustomerAction} submitLabel="Add customer" resetOnSuccess className="grid gap-4 md:grid-cols-3">
          <Field idPrefix="new-customer" label="Company name" name="name" required />
          <FileField idPrefix="new-customer" label="Logo" accept={IMAGE_ACCEPT} />
          <Field idPrefix="new-customer" label="Website (optional)" name="website" hint="https://…" />
        </ActionForm>
      </section>
    </div>
  );
}
