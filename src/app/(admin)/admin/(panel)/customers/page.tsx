import { Suspense } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { rolesFor } from "@/components/admin/nav";
import { adminInput, card, Checkbox, ConfirmTick, dangerButton, Field, FileField, IMAGE_ACCEPT, Loading, PageTitle } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { addCustomerAction, deleteCustomerAction, updateCustomerAction } from "./actions";
import { mediaHref } from "@/lib/media-href";

export default function CustomersPage() {
  return (
    <>
      <PageTitle title="Customers & mills" />
      <p className="-mt-4 mb-8 max-w-2xl text-mist">
        Customer logos appear under “Companies we have supplied”; mill logos in the mills section (its heading is set in Contact & timeline). Only list companies you have actually supplied, and call a mill “authorized” only with its authorization. PNG with a transparent or white background
        works best (JPG, PNG or WEBP, up to 8 MB). Without a logo, the name is shown instead.
      </p>
      <Suspense fallback={<Loading />}>
        <Customers />
      </Suspense>
    </>
  );
}

async function Customers() {
  await requireUser(rolesFor("/admin/customers/"));
  const rows = await db.partnerLogo.findMany({ orderBy: [{ kind: "asc" }, { order: "asc" }] });
  return (
    <div className="space-y-6">
      {rows.map((c) => (
        <section key={c.id} aria-label={c.name} className={`${card} grid gap-6 p-6 md:grid-cols-[180px_minmax(0,1fr)]`}>
          <div className="flex h-24 w-full max-w-[180px] items-center justify-center bg-white p-3">
            {c.imageKey && (c.published || c.imageKey.startsWith("/")) ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
              <img src={mediaHref(c.imageKey)} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-center text-sm text-ink">{c.imageKey ? "Hidden" : c.name}</span>
            )}
          </div>
          <div className="min-w-0">
            <ActionForm action={updateCustomerAction.bind(null, c.id)} className="grid gap-4 md:grid-cols-2">
              <Field idPrefix={`p${c.id}`} label="Company name" name="name" defaultValue={c.name} required />
              <FileField idPrefix={`p${c.id}`} label={c.imageKey ? "Replace logo" : "Upload logo"} accept={IMAGE_ACCEPT} purpose="image" />
              <Field idPrefix={`p${c.id}`} label="Website (optional)" name="website" defaultValue={c.website} hint="https://…" />
              <KindSelect idPrefix={`p${c.id}`} value={c.kind} />
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
          Add a customer or mill
        </h2>
        <ActionForm action={addCustomerAction} submitLabel="Add" resetOnSuccess className="grid gap-4 md:grid-cols-2">
          <Field idPrefix="new-customer" label="Company name" name="name" required />
          <FileField idPrefix="new-customer" label="Logo" accept={IMAGE_ACCEPT} purpose="image" />
          <Field idPrefix="new-customer" label="Website (optional)" name="website" hint="https://…" />
          <KindSelect idPrefix="new-customer" />
        </ActionForm>
      </section>
    </div>
  );
}

function KindSelect({ idPrefix, value }: { idPrefix: string; value?: "CUSTOMER" | "MILL" }) {
  return (
    <div className="min-w-0">
      <label htmlFor={`${idPrefix}-kind`} className="mb-1.5 block text-sm text-surface/80">
        Shown as
      </label>
      <select id={`${idPrefix}-kind`} name="kind" defaultValue={value ?? "CUSTOMER"} className={adminInput}>
        <option value="CUSTOMER">Customer (“Companies we have supplied”)</option>
        <option value="MILL">Steel mill (mills section)</option>
      </select>
    </div>
  );
}
