import { Suspense } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { rolesFor } from "@/components/admin/nav";
import { adminInput, card, Checkbox, ConfirmTick, dangerButton, Field, FileField, IMAGE_ACCEPT, Loading, PageTitle } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { addGalleryAction, deleteGalleryAction, updateGalleryAction } from "./actions";

export default function GalleryPage() {
  return (
    <>
      <PageTitle title="Gallery" />
      <p className="-mt-4 mb-8 max-w-2xl text-mist">
        Photos in the “Infrastructure” section of the home page. JPG, PNG or WEBP up to 8 MB; about 2000 px wide is plenty. Slots without a photo show
        a placeholder with what to shoot.
      </p>
      <Suspense fallback={<Loading />}>
        <Gallery />
      </Suspense>
    </>
  );
}

function AspectSelect({ idPrefix, value }: { idPrefix: string; value?: string }) {
  return (
    <div className="min-w-0">
      <label htmlFor={`${idPrefix}-aspect`} className="mb-1.5 block text-sm text-surface/80">
        Shape
      </label>
      <select id={`${idPrefix}-aspect`} name="aspect" defaultValue={value ?? "landscape"} className={adminInput}>
        <option value="landscape">Landscape (4:3)</option>
        <option value="portrait">Portrait (3:4)</option>
        <option value="square">Square</option>
      </select>
    </div>
  );
}

async function Gallery() {
  await requireUser(rolesFor("/admin/gallery/"));
  const items = await db.galleryItem.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <section aria-labelledby="add-photo" className={`${card} p-6`}>
        <h2 id="add-photo" className="mb-4 font-display text-lg font-semibold">
          Add a photo
        </h2>
        <ActionForm action={addGalleryAction} submitLabel="Upload photo" resetOnSuccess className="grid gap-4 md:grid-cols-3">
          <Field idPrefix="new-photo" label="What the photo shows" name="label" required />
          <AspectSelect idPrefix="new-photo" />
          <FileField idPrefix="new-photo" label="Photo" accept={IMAGE_ACCEPT} required />
        </ActionForm>
      </section>

      {items.map((g) => (
        <section key={g.id} aria-label={g.label} className={`${card} grid gap-6 p-6 md:grid-cols-[180px_minmax(0,1fr)]`}>
          <div className="aspect-[4/3] w-full max-w-[180px] overflow-hidden bg-graphite">
            {g.imageKey && g.published ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
              <img src={`/files/${g.imageKey}`} alt="" className="h-full w-full object-cover" />
            ) : (
              <p className="p-3 text-xs text-mist">{g.imageKey ? "Hidden from the website" : `No photo yet. Shot needed: ${g.shot}`}</p>
            )}
          </div>
          <div className="min-w-0">
            <ActionForm action={updateGalleryAction.bind(null, g.id)} className="grid gap-4 md:grid-cols-2">
              <Field idPrefix={`g${g.id}`} label="What the photo shows" name="label" defaultValue={g.label} required />
              <AspectSelect idPrefix={`g${g.id}`} value={g.aspect} />
              <FileField idPrefix={`g${g.id}`} label={g.imageKey ? "Replace photo" : "Upload photo"} accept={IMAGE_ACCEPT} />
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-24">
                  <Field idPrefix={`g${g.id}`} label="Order" name="order" type="number" defaultValue={g.order} />
                </div>
                <Checkbox label="Show on the website" name="published" defaultChecked={g.published} />
              </div>
            </ActionForm>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-mist">Delete</summary>
              <ActionForm action={deleteGalleryAction.bind(null, g.id)} submitLabel="Delete photo" submitClassName={dangerButton}>
                <ConfirmTick />
              </ActionForm>
            </details>
          </div>
        </section>
      ))}
    </div>
  );
}
