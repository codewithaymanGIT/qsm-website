"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";
import type { QuoteInput } from "@/lib/quote-schema";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FileField, type PickedFile } from "./FileField";

type Props = {
  grades: { slug: string; name: string }[];
  whatsapp: string;
  /** Grade to preselect (from the page, or from ?grade= via QuoteFormFromUrl). */
  defaultGrade?: string;
  /** Service the enquiry is about, shown above the form. */
  service?: string;
  title?: string;
};

type Errors = Partial<Record<keyof QuoteInput, string>>;

const empty: QuoteInput = { name: "", company: "", phone: "", email: "", grade: "", dimensions: "", quantity: "", message: "" };
const noFile: PickedFile = { file: null, error: null };

const field =
  "w-full border border-white/15 bg-graphite px-4 py-3 text-base text-surface placeholder:text-surface/35 transition-colors focus:border-gold focus:outline-none aria-[invalid=true]:border-red-400/70";

/** Reads ?grade= from the address; must sit inside a Suspense boundary. */
export function QuoteFormFromUrl(props: Props) {
  const fromUrl = useSearchParams().get("grade") ?? "";
  const known = props.grades.some((g) => g.slug === fromUrl);
  return <QuoteForm key={fromUrl} {...props} defaultGrade={props.defaultGrade ?? (known ? fromUrl : undefined)} />;
}

export function QuoteForm({ grades, whatsapp, defaultGrade, service, title = "Send an enquiry" }: Props) {
  const [values, setValues] = useState<QuoteInput>({ ...empty, grade: defaultGrade ?? "" });
  const [errors, setErrors] = useState<Errors>({});
  const [drawing, setDrawing] = useState<PickedFile>(noFile);
  const [cad, setCad] = useState<PickedFile>(noFile);
  const [sent, setSent] = useState(false);

  const set = (key: keyof QuoteInput) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    // Loaded on submit so the validation library never weighs down page load.
    const { quoteSchema } = await import("@/lib/quote-schema");
    const result = quoteSchema.safeParse(values);
    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) next[issue.path[0] as keyof QuoteInput] ??= issue.message;
      setErrors(next);
      return;
    }
    if (drawing.error || cad.error) return;
    setErrors({});
    setSent(true);
  }

  const gradeName = grades.find((g) => g.slug === values.grade)?.name;

  if (sent) {
    const url = buildWhatsAppUrl(whatsapp, gradeName, { dimensions: values.dimensions, quantity: values.quantity });
    return (
      <div className="border border-gold/40 bg-graphite p-8 sm:p-10" role="status">
        <p className="font-display text-2xl font-semibold">Preview only: enquiries are not sent yet.</p>
        <p className="mt-4 leading-relaxed text-mist">
          On the live website this enquiry is saved, emailed to the team and tracked until it is answered. For now,
          send the same details on WhatsApp.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-12 items-center gap-2.5 bg-[#1F7A4A] px-6 font-medium text-white hover:bg-[#25915a]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Send on WhatsApp
        </a>
        <button type="button" onClick={() => setSent(false)} className="mt-4 block min-h-11 text-sm text-mist underline underline-offset-4 hover:text-gold">
          Edit enquiry
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="border border-white/10 bg-ink/60 p-6 sm:p-10">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {service && <p className="mt-2 text-mist">Service: {service}</p>}
      <div className="mt-8 grid gap-5 md:grid-cols-2 [&>*]:min-w-0">
        <Field id="q-name" label="Your name" error={errors.name}>
          <input id="q-name" autoComplete="name" value={values.name} onChange={set("name")} className={field} aria-invalid={!!errors.name} aria-describedby="q-name-err" />
        </Field>
        <Field id="q-company" label="Company (optional)">
          <input id="q-company" autoComplete="organization" value={values.company} onChange={set("company")} className={field} />
        </Field>
        <Field id="q-phone" label="Phone" error={errors.phone}>
          <input id="q-phone" type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={set("phone")} className={field} aria-invalid={!!errors.phone} aria-describedby="q-phone-err" />
        </Field>
        <Field id="q-email" label="Email" error={errors.email}>
          <input id="q-email" type="email" autoComplete="email" value={values.email} onChange={set("email")} className={field} aria-invalid={!!errors.email} aria-describedby="q-email-err" />
        </Field>
        <Field id="q-grade" label="Steel grade">
          <select id="q-grade" value={values.grade} onChange={set("grade")} className={field}>
            <option value="">Not sure / other grade</option>
            {grades.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="q-quantity" label="Quantity">
          <input id="q-quantity" placeholder="e.g. 4 pieces or 250 kg" value={values.quantity} onChange={set("quantity")} className={field} />
        </Field>
        <div className="md:col-span-2">
          <Field id="q-dimensions" label="Dimensions">
            <input id="q-dimensions" placeholder="e.g. Round 120 mm dia x 300 mm, or Flat 50 x 200 x 300 mm" value={values.dimensions} onChange={set("dimensions")} className={field} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field id="q-message" label="Message (optional)" error={errors.message}>
            <textarea id="q-message" rows={4} value={values.message} onChange={set("message")} className={field} aria-invalid={!!errors.message} aria-describedby="q-message-err" />
          </Field>
        </div>
        <FileField label="Drawing (PDF, DWG, DXF or image)" hint="Optional. Up to 20 MB." accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.webp" value={drawing} onChange={setDrawing} />
        <FileField label="CAD file (STEP, DWG or DXF)" hint="Optional. Up to 20 MB." accept=".step,.stp,.dwg,.dxf" value={cad} onChange={setCad} />
      </div>
      <button type="submit" className="mt-8 inline-flex min-h-12 w-full items-center justify-center bg-gold px-8 font-medium text-ink transition-colors hover:bg-[#d8b679] sm:w-auto">
        Send enquiry
      </button>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-surface/80">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
