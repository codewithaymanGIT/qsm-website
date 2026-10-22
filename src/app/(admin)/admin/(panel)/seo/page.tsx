import { Suspense } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { rolesFor } from "@/components/admin/nav";
import { card, Checkbox, Field, Loading, PageTitle } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { publicPaths } from "@/lib/seo";
import { saveSeoAction } from "./actions";

export default function SeoPage() {
  return (
    <>
      <PageTitle title="SEO" />
      <p className="-mt-4 mb-8 max-w-2xl text-mist">
        Every page already has a title and description written for Google. Fill these in only to replace them; leave blank to keep the default. “Hide
        from Google” stops a page appearing in search results.
      </p>
      <Suspense fallback={<Loading />}>
        <SeoList />
      </Suspense>
    </>
  );
}

const slugId = (path: string) => `seo${path.replace(/[^a-z0-9]+/gi, "-")}`;

async function SeoList() {
  await requireUser(rolesFor("/admin/seo/"));
  const [paths, entries] = await Promise.all([publicPaths(), db.seoEntry.findMany()]);
  const byPath = new Map(entries.map((e) => [e.path, e]));
  return (
    <ul className="space-y-3">
      {paths.map((path) => {
        const e = byPath.get(path);
        return (
          <li key={path} className={card}>
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-5 py-4">
                <span className="font-mono text-sm break-all">{path}</span>
                <span className="text-xs tracking-wide text-mist uppercase">{e?.noindex ? "Hidden from Google" : e ? "Custom" : "Default"}</span>
              </summary>
              <ActionForm action={saveSeoAction.bind(null, path)} className="grid gap-4 border-t border-white/10 px-5 py-5">
                <Field
                  idPrefix={slugId(path)}
                  label="Title"
                  name="title"
                  defaultValue={e?.title}
                  hint="Up to 70 characters. “| Quality Steel and Metals” is added automatically."
                />
                <Field
                  idPrefix={slugId(path)}
                  label="Description"
                  name="description"
                  as="textarea"
                  rows={3}
                  defaultValue={e?.description}
                  hint="Up to 200 characters; Google shows about 155."
                />
                <Checkbox label="Hide this page from Google" name="noindex" defaultChecked={e?.noindex} />
              </ActionForm>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
