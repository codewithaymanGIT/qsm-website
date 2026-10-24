import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { rolesFor } from "@/components/admin/nav";
import { card, Checkbox, Field, FileField, IMAGE_ACCEPT, Loading } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { saveServiceAction } from "../actions";

export default function EditServicePage({ params }: PageProps<"/admin/services/[id]">) {
  return (
    <>
      <Link href="/admin/services/" className="text-sm text-mist hover:text-accent">
        ← All services
      </Link>
      <Suspense fallback={<Loading />}>
        <EditService params={params} />
      </Suspense>
    </>
  );
}

async function EditService({ params }: Pick<PageProps<"/admin/services/[id]">, "params">) {
  await requireUser(rolesFor("/admin/services/"));
  const s = await db.service.findUnique({ where: { id: (await params).id } });
  if (!s) notFound();
  return (
    <div className="space-y-6">
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{s.name}</h1>
        <a href={`/services/${s.slug}/`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
          View on website ↗
        </a>
      </div>
      <ActionForm action={saveServiceAction.bind(null, s.id)} className={`${card} grid gap-5 p-6`}>
        <Field label="Name" name="name" defaultValue={s.name} required />
        <Field label="One-line summary" name="summary" defaultValue={s.summary} required />
        <Field label="Description" name="description" as="textarea" rows={7} defaultValue={s.description.join("\n")} hint="One paragraph per line." />
        <Field
          label="Capabilities"
          name="capabilities"
          as="textarea"
          rows={6}
          defaultValue={s.capabilities.join("\n")}
          hint="One per line. Only list what you actually do."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {(["Main photo (the work in progress)", "Second photo (finished material)"] as const).map((label, i) => {
            const key = s.imageKeys[i];
            return (
              <div key={label} className="flex min-w-0 flex-col gap-3">
                {key && (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                  <img src={`/files/${key}`} alt="" className="aspect-[4/3] w-full max-w-60 object-cover" />
                )}
                <FileField idPrefix={`svc${i}`} name={`photo${i + 1}`} label={key ? `Replace: ${label}` : label} accept={IMAGE_ACCEPT} purpose="image" />
                {key && <Checkbox label="Remove photo" name={`removePhoto${i + 1}`} />}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <div className="w-32">
            <Field label="Order" name="order" type="number" defaultValue={s.order} />
          </div>
          <Checkbox label="Show on the website" name="published" defaultChecked={s.published} />
        </div>
      </ActionForm>
    </div>
  );
}
