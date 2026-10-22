import { ActionForm } from "@/components/admin/ActionForm";
import { RowsEditor } from "@/components/admin/RowsEditor";
import { adminInput, card, Checkbox, Field } from "@/components/admin/ui";
import type { CompositionRow } from "@/content/types";
import type { Product } from "@/generated/prisma/client";
import { saveProductAction } from "./actions";

type Mechanical = { label: string; value: string }[];
type HeatStep = { step: string; detail: string }[];

export function ProductForm({ product, categories }: { product: Product | null; categories: { id: string; name: string }[] }) {
  const p = product;
  return (
    <ActionForm action={saveProductAction.bind(null, p?.id ?? null)} submitLabel={p ? "Save changes" : "Create grade"} className="space-y-8">
      <section className={`${card} grid gap-5 p-6 md:grid-cols-2`}>
        <Field label="Grade name" name="name" defaultValue={p?.name} required />
        <Field
          label="Web address"
          name="slug"
          defaultValue={p?.slug}
          hint="Shown as /grades/this-name/. Lowercase letters, numbers and hyphens."
          required
        />
        <div className="min-w-0">
          <label htmlFor="f-categoryId" className="mb-1.5 block text-sm text-surface/80">
            Category
          </label>
          <select id="f-categoryId" name="categoryId" defaultValue={p?.categoryId ?? ""} className={adminInput} required>
            <option value="" disabled>
              Choose…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Field label="Tagline" name="tagline" defaultValue={p?.tagline} hint="One short line, e.g. Hot work die steel." required />
        <Field
          label="Equivalent grades"
          name="equivalents"
          defaultValue={p?.equivalents.join(", ")}
          hint="Separate with commas, e.g. 1.2344, SKD61"
        />
        <Field label="Hardness" name="hardness" defaultValue={p?.hardness} hint="e.g. Supplied annealed, max 229 HB" />
        <div className="md:col-span-2">
          <Field label="Overview" name="overview" as="textarea" rows={5} defaultValue={p?.overview} required />
        </div>
        <Field label="Applications" name="applications" as="textarea" defaultValue={p?.applications.join("\n")} hint="One per line." />
        <Field label="Industries" name="industries" as="textarea" defaultValue={p?.industries.join("\n")} hint="One per line." />
        <Field label="Forms supplied" name="forms" as="textarea" defaultValue={p?.forms.join("\n")} hint="One per line, e.g. Round bar." />
        <div className="flex flex-col gap-3">
          <Field label="Order in its category" name="order" type="number" defaultValue={p?.order ?? 0} hint="Lower numbers show first." />
          <Checkbox label="Show on the website" name="published" defaultChecked={p?.published ?? true} />
        </div>
      </section>

      <section className={`${card} space-y-8 p-6`}>
        <RowsEditor
          legend="Chemical composition (%)"
          prefix="composition"
          addLabel="Add element"
          initial={(p?.composition as CompositionRow[] | undefined) ?? []}
          fields={[
            { key: "element", label: "Element", placeholder: "C" },
            { key: "min", label: "Min %", placeholder: "0.35" },
            { key: "max", label: "Max %", placeholder: "0.42" },
          ]}
        />
        <RowsEditor
          legend="Mechanical properties"
          prefix="mechanical"
          addLabel="Add property"
          initial={(p?.mechanical as Mechanical | undefined) ?? []}
          fields={[
            { key: "label", label: "Property", placeholder: "Hardened" },
            {
              key: "value",
              label: "Value",
              placeholder: "50–54 HRC",
              wide: true,
            },
          ]}
        />
        <RowsEditor
          legend="Heat treatment"
          prefix="heatTreatment"
          addLabel="Add step"
          initial={(p?.heatTreatment as HeatStep | undefined) ?? []}
          fields={[
            { key: "step", label: "Step", placeholder: "Hardening" },
            {
              key: "detail",
              label: "Detail",
              placeholder: "1020–1050 °C, oil or air",
              wide: true,
            },
          ]}
        />
      </section>
    </ActionForm>
  );
}
