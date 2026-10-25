import { Suspense } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { rolesFor } from "@/components/admin/nav";
import { RowsEditor } from "@/components/admin/RowsEditor";
import { card, Field, Loading, PageTitle } from "@/components/admin/ui";
import type { GroupCompany, Settings, TimelineEntry } from "@/content/types";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { saveContactAction, saveGroupAction, saveTimelineAction } from "./actions";

export default function SettingsPage() {
  return (
    <>
      <PageTitle title="Contact & timeline" />
      <Suspense fallback={<Loading />}>
        <SettingsForms />
      </Suspense>
    </>
  );
}

async function SettingsForms() {
  await requireUser(rolesFor("/admin/settings/"));
  const [contactRow, timelineRow, groupRow] = await Promise.all([
    db.setting.findUnique({ where: { key: "contact" } }),
    db.setting.findUnique({ where: { key: "timeline" } }),
    db.setting.findUnique({ where: { key: "groupCompanies" } }),
  ]);
  const group = (groupRow?.value ?? []) as GroupCompany[];
  const s = (contactRow?.value ?? {}) as Partial<Settings>;
  const timeline = (timelineRow?.value ?? []) as TimelineEntry[];

  return (
    <div className="space-y-8">
      <section aria-labelledby="contact" className={`${card} p-6`}>
        <h2 id="contact" className="mb-1 font-display text-lg font-semibold">
          Contact details
        </h2>
        <p className="mb-5 text-sm text-mist">
          Used in the header, footer, contact page, WhatsApp buttons and Google search results. Only the office address is shown publicly.
        </p>
        <ActionForm action={saveContactAction} className="grid gap-5 md:grid-cols-2">
          <Field label="Contact person" name="contactName" defaultValue={s.contactName} required />
          <Field label="Email" name="email" type="email" defaultValue={s.email} hint="Shown on the website. Enquiry notification emails go to the address set up on the server." required />
          <Field label="Phone" name="phone" defaultValue={s.phone} hint="With country code, e.g. +91 92841 27584" required />
          <Field label="WhatsApp number" name="whatsapp" defaultValue={s.whatsapp} hint="With country code." required />
          <div className="md:col-span-2">
            <Field label="Office address" name="officeAddress" as="textarea" rows={3} defaultValue={s.officeAddress} required />
          </div>
          <div className="md:col-span-2">
            <Field
              label="Google Maps embed link (optional)"
              name="mapEmbedUrl"
              defaultValue={s.mapEmbedUrl}
              hint='In Google Maps: Share → Embed a map → copy only the link inside src="…" (starts with https://www.google.com/maps/embed?). A link like https://www.google.com/maps?q=18.80,73.71&output=embed also works.'
            />
          </div>
        </ActionForm>
      </section>

      <section aria-labelledby="timeline" className={`${card} p-6`}>
        <h2 id="timeline" className="mb-1 font-display text-lg font-semibold">
          Company timeline
        </h2>
        <p className="mb-5 text-sm text-mist">Shown on the home and About pages, in this order.</p>
        <ActionForm action={saveTimelineAction}>
          <RowsEditor
            legend="Milestones"
            prefix="rows"
            addLabel="Add milestone"
            initial={timeline}
            fields={[
              { key: "year", label: "Year", placeholder: "2009" },
              {
                key: "title",
                label: "Title",
                placeholder: "Our own shop",
                wide: true,
              },
              { key: "body", label: "Text", wide: true, multiline: true },
            ]}
          />
        </ActionForm>
      </section>

      <section aria-labelledby="group" className={`${card} p-6`}>
        <h2 id="group" className="mb-1 font-display text-lg font-semibold">
          Group companies
        </h2>
        <p className="mb-5 text-sm text-mist">Sister concerns and manufacturing units, shown on the About page. Leave empty to hide the section.</p>
        <ActionForm action={saveGroupAction}>
          <RowsEditor
            legend="Companies"
            prefix="group"
            addLabel="Add company"
            initial={group}
            fields={[
              { key: "name", label: "Company name", placeholder: "Kamal Forging Pvt Ltd", wide: true },
              { key: "role", label: "Role", placeholder: "Sister concern" },
              { key: "location", label: "Location / address", wide: true, multiline: true },
            ]}
          />
        </ActionForm>
      </section>
    </div>
  );
}
