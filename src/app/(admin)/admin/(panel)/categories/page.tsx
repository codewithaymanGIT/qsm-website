import { Suspense } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { rolesFor } from "@/components/admin/nav";
import { card, Checkbox, ConfirmTick, dangerButton, Field, FileField, IMAGE_ACCEPT, Loading, PageTitle } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { deleteCategoryAction, saveCategoryAction } from "./actions";

export default function CategoriesPage() {
  return (
    <>
      <PageTitle title="Categories" />
      <Suspense fallback={<Loading />}>
        <Categories />
      </Suspense>
    </>
  );
}

type CategoryRow = { name: string; slug: string; shortDescription: string; order: number; imageKey: string | null };

function CategoryFields({ idPrefix, c }: { idPrefix: string; c?: CategoryRow }) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem]">
      <Field idPrefix={idPrefix} label="Name" name="name" defaultValue={c?.name} required />
      <Field idPrefix={idPrefix} label="Web address" name="slug" defaultValue={c?.slug} hint="/products/this-name/" required />
      <Field idPrefix={idPrefix} label="Order" name="order" type="number" defaultValue={c?.order ?? 0} />
      <div className="md:col-span-3">
        <Field
          idPrefix={idPrefix}
          label="Short description"
          name="shortDescription"
          as="textarea"
          rows={2}
          defaultValue={c?.shortDescription}
          required
        />
      </div>
      <div className="flex flex-wrap items-end gap-5 md:col-span-3">
        {c?.imageKey && (
          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
          <img src={`/files/${c.imageKey}`} alt="" className="h-20 w-32 object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <FileField
            idPrefix={idPrefix}
            label={c?.imageKey ? "Replace card photo" : "Card photo (optional)"}
            accept={IMAGE_ACCEPT}
            purpose="image"
            hint="JPG, PNG or WEBP up to 8 MB. Use your own photos or ones you have the right to use (e.g. Unsplash, Pexels)."
          />
        </div>
        {c?.imageKey && <Checkbox label="Remove photo" name="removePhoto" />}
      </div>
    </div>
  );
}

async function Categories() {
  await requireUser(rolesFor("/admin/categories/"));
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return (
    <div className="space-y-6">
      {categories.map((c) => (
        <section key={c.id} aria-label={c.name} className={`${card} p-6`}>
          <p className="mb-4 text-sm text-mist">
            {c._count.products} grade{c._count.products === 1 ? "" : "s"}
          </p>
          <ActionForm action={saveCategoryAction.bind(null, c.id)}>
            <CategoryFields idPrefix={`c${c.id}`} c={c} />
          </ActionForm>
          {c._count.products === 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-mist">Delete this category</summary>
              <ActionForm action={deleteCategoryAction.bind(null, c.id)} submitLabel="Delete" submitClassName={dangerButton}>
                <ConfirmTick />
              </ActionForm>
            </details>
          )}
        </section>
      ))}
      <section aria-labelledby="add-cat" className={`${card} border-dashed p-6`}>
        <h2 id="add-cat" className="mb-4 font-display text-lg font-semibold">
          Add a category
        </h2>
        <ActionForm action={saveCategoryAction.bind(null, null)} submitLabel="Add category" resetOnSuccess>
          <CategoryFields idPrefix="new-cat" />
        </ActionForm>
      </section>
    </div>
  );
}
