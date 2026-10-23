import { Suspense } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { rolesFor } from "@/components/admin/nav";
import { card, ConfirmTick, dangerButton, Field, FileField, Loading, PageTitle, PDF_ACCEPT } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { addCertificateAction, brochureAction, deleteCertificateAction, removeBrochureAction } from "./actions";

export default function DownloadsPage() {
  return (
    <>
      <PageTitle title="Downloads" />
      <p className="-mt-4 mb-8 max-w-2xl text-mist">
        Files visitors can download from the About page. PDF only, up to 20 MB. Grade datasheets are added on each product. Mill test certificates are
        confidential and are not uploaded here.
      </p>
      <Suspense fallback={<Loading />}>
        <Downloads />
      </Suspense>
    </>
  );
}

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { timeZone: "UTC", dateStyle: "medium" });

async function Downloads() {
  await requireUser(rolesFor("/admin/downloads/"));
  const [brochure, certificates] = await Promise.all([
    db.download.findFirst({
      where: { kind: "BROCHURE" },
      orderBy: { createdAt: "desc" },
    }),
    db.certificate.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  return (
    <div className="space-y-8">
      <section aria-labelledby="brochure" className={`${card} p-6`}>
        <h2 id="brochure" className="font-display text-lg font-semibold">
          Company brochure
        </h2>
        {brochure ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <a href={`/files/${brochure.fileKey}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              {brochure.title} <span className="text-sm text-mist">({brochure.fileName})</span>
            </a>
            <ActionForm action={removeBrochureAction} submitLabel="Remove" submitClassName={dangerButton}>
              {null}
            </ActionForm>
          </div>
        ) : (
          <p className="mt-2 text-sm text-mist">No brochure yet. The download button stays hidden until one is uploaded.</p>
        )}
        <ActionForm
          action={brochureAction}
          submitLabel={brochure ? "Replace brochure" : "Upload brochure"}
          resetOnSuccess
          className="mt-5 grid gap-4 md:grid-cols-2"
        >
          <Field idPrefix="brochure" label="Title" name="title" defaultValue={brochure?.title ?? "Company brochure"} />
          <FileField idPrefix="brochure" label="PDF file" accept={PDF_ACCEPT} purpose="document" required />
        </ActionForm>
      </section>

      <section aria-labelledby="certs" className={`${card} p-6`}>
        <h2 id="certs" className="font-display text-lg font-semibold">
          Company certificates
        </h2>
        <p className="mt-1 text-sm text-mist">For example ISO 9001 or GST registration. Upload only certificates the company actually holds.</p>
        {certificates.length > 0 && (
          <ul className="mt-5 divide-y divide-white/10 border border-white/10">
            {certificates.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <a href={`/files/${c.fileKey}`} target="_blank" rel="noopener noreferrer" className="min-w-0 break-words hover:text-accent">
                  {c.title}
                  <span className="text-sm text-mist">
                    {c.issuer && ` · ${c.issuer}`}
                    {c.validUntil && ` · valid until ${fmtDate(c.validUntil)}`}
                  </span>
                </a>
                <details>
                  <summary className="cursor-pointer text-sm text-mist">Delete</summary>
                  <ActionForm action={deleteCertificateAction.bind(null, c.id)} submitLabel="Delete" submitClassName={dangerButton}>
                    <ConfirmTick />
                  </ActionForm>
                </details>
              </li>
            ))}
          </ul>
        )}
        <ActionForm action={addCertificateAction} submitLabel="Add certificate" resetOnSuccess className="mt-5 grid gap-4 md:grid-cols-2">
          <Field idPrefix="cert" label="Certificate name" name="title" required />
          <Field idPrefix="cert" label="Issued by (optional)" name="issuer" />
          <Field idPrefix="cert" label="Valid until (optional)" name="validUntil" type="date" />
          <FileField idPrefix="cert" label="PDF file" accept={PDF_ACCEPT} purpose="document" required />
        </ActionForm>
      </section>
    </div>
  );
}
