import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { rolesFor } from "@/components/admin/nav";
import { adminInput, card, ConfirmTick, dangerButton, Field, Loading } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { deleteDownloadAction, deleteProductAction, uploadDatasheetAction } from "../actions";
import { ProductForm } from "../ProductForm";

export default function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  return (
    <>
      <Link href="/admin/products/" className="text-sm text-mist hover:text-accent">
        ← All products
      </Link>
      <Suspense fallback={<Loading />}>
        <EditProduct params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

async function EditProduct({ params, searchParams }: Pick<PageProps<"/admin/products/[id]">, "params" | "searchParams">) {
  await requireUser(rolesFor("/admin/products/"));
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { category: true, downloads: { orderBy: { createdAt: "asc" } } },
    }),
    db.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!product) notFound();
  const created = (await searchParams).created === "1";

  return (
    <div className="space-y-10">
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{product.name}</h1>
        {product.published && (
          <a href={`/grades/${product.slug}/`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
            View on website ↗
          </a>
        )}
      </div>
      {created && <p className="border border-[#8FD49A]/40 px-4 py-3 text-[#8FD49A]">Grade created.</p>}

      <ProductForm product={product} categories={categories} />

      <section aria-labelledby="datasheets" className={`${card} p-6`}>
        <h2 id="datasheets" className="font-display text-lg font-semibold">
          Datasheets
        </h2>
        <p className="mt-1 text-sm text-mist">
          PDF, up to 20 MB. Visitors can download these from the grade page. Mill test certificates stay private and are shared on request.
        </p>
        {product.downloads.length > 0 && (
          <ul className="mt-5 divide-y divide-white/10 border border-white/10">
            {product.downloads.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <a href={`/files/${d.fileKey}`} target="_blank" rel="noopener noreferrer" className="min-w-0 break-words hover:text-accent">
                  {d.title}{" "}
                  <span className="text-sm text-mist">
                    ({d.fileName}, {kb(d.sizeBytes)})
                  </span>
                </a>
                <ActionForm action={deleteDownloadAction.bind(null, d.id)} submitLabel="Remove" submitClassName={dangerButton}>
                  {null}
                </ActionForm>
              </li>
            ))}
          </ul>
        )}
        <ActionForm
          action={uploadDatasheetAction.bind(null, product.id)}
          submitLabel="Upload datasheet"
          resetOnSuccess
          className="mt-5 grid gap-4 md:grid-cols-2"
        >
          <Field idPrefix="ds" label="Title" name="title" defaultValue={`${product.name} datasheet`} />
          <div className="min-w-0">
            <label htmlFor="ds-file" className="mb-1.5 block text-sm text-surface/80">
              PDF file
            </label>
            <input id="ds-file" name="file" type="file" accept="application/pdf,.pdf" data-purpose="document" required className={`${adminInput} min-w-0`} />
          </div>
        </ActionForm>
      </section>

      <section aria-labelledby="danger" className="border border-[#FF9C9C]/30 p-6">
        <h2 id="danger" className="font-display text-lg font-semibold">
          Delete this grade
        </h2>
        <p className="mt-1 text-sm text-mist">Removes the page and its datasheets. To hide it for now, untick “Show on the website” instead.</p>
        <ActionForm action={deleteProductAction.bind(null, product.id)} submitLabel={`Delete ${product.name}`} submitClassName={dangerButton}>
          <ConfirmTick />
        </ActionForm>
      </section>
    </div>
  );
}
