"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";
import type { QuoteInput } from "@/lib/quote-schema";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FileField, type PickedFile } from "./FileField";

type Props = {
  grades: { slug: string; name: string }[];
  whatsapp: string;
  /** Grade to preselect (from the page, or from ?grade= via QuoteFormFromUrl). */
  defaultGrade?: string;
  /** Size and quantity carried over from the weight calculator. */
  defaultDimensions?: string;
  defaultQuantity?: string;
  /** Service the enquiry is about, shown above the form. */
  service?: string;
  title?: string;
};

type Errors = Partial<Record<keyof QuoteInput | "drawing" | "cad", string>>;

// The private review link has no server; there the form explains instead of sending.
const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";

type Outcome =
  | { kind: "editing" }
  | { kind: "sending" }
  | { kind: "preview" }
  | { kind: "sent"; reference: string }
  | { kind: "failed"; message: string };

const empty: QuoteInput = { name: "", company: "", phone: "", email: "", grade: "", dimensions: "", quantity: "", message: "" };
const noFile: PickedFile = { file: null, error: null };

const field =
  "w-full border border-white/15 bg-graphite px-4 py-3 text-base text-surface placeholder:text-surface/35 transition-colors focus:border-accent focus:outline-none aria-[invalid=true]:border-red-400/70";

/** Reads ?grade= from the address; must sit inside a Suspense boundary. */
export function QuoteFormFromUrl(props: Props) {
  const params = useSearchParams();
  const fromUrl = params.get("grade") ?? "";
  const known = props.grades.some((g) => g.slug === fromUrl);
  return (
    <QuoteForm
      key={params.toString()}
      {...props}
      defaultGrade={props.defaultGrade ?? (known ? fromUrl : undefined)}
      defaultDimensions={params.get("dimensions")?.slice(0, 200) ?? undefined}
      defaultQuantity={params.get("quantity")?.slice(0, 100) ?? undefined}
    />
  );
}

export function QuoteForm({ grades, whatsapp, defaultGrade, defaultDimensions, defaultQuantity, service, title = "Send an enquiry" }: Props) {
  const [values, setValues] = useState<QuoteInput>({
    ...empty,
    grade: defaultGrade ?? "",
    dimensions: defaultDimensions ?? "",
    quantity: defaultQuantity ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [drawing, setDrawing] = useState<PickedFile>(noFile);
  const [cad, setCad] = useState<PickedFile>(noFile);
  // Unique per form instance: a page can hold more than one form (and Next keeps the previous page mounted, hidden).
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const [outcome, setOutcome] = useState<Outcome>({ kind: "editing" });
  const [trap, setTrap] = useState("");

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
    if (PREVIEW) return setOutcome({ kind: "preview" });

    setOutcome({ kind: "sending" });
    const body = new FormData();
    for (const [k, v] of Object.entries(values)) body.append(k, v ?? "");
    if (drawing.file) body.append("drawing", drawing.file);
    if (cad.file) body.append("cad", cad.file);
    if (service) body.append("service", service);
    body.append("pagePath", window.location.pathname);
    body.append("website", trap);
    try {
      const res = await fetch("/api/leads", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) return setOutcome({ kind: "sent", reference: data.reference });
      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        return setOutcome({ kind: "editing" });
      }
      setOutcome({ kind: "failed", message: data.error ?? "Your enquiry could not be sent." });
    } catch {
      setOutcome({ kind: "failed", message: "No connection. Check your internet and try again." });
    }
  }

  const gradeName = grades.find((g) => g.slug === values.grade)?.name;

  const whatsappUrl = buildWhatsAppUrl(whatsapp, gradeName, { dimensions: values.dimensions, quantity: values.quantity });

  if (outcome.kind === "sent" || outcome.kind === "preview") {
    return (
      <div className="border border-accent/40 bg-graphite p-8 sm:p-10" role="status">
        {outcome.kind === "sent" ? (
          <>
            <p className="font-display text-2xl font-semibold">Enquiry received.</p>
            <p className="mt-4 leading-relaxed text-mist">
              Your reference is <span className="font-semibold text-surface select-all">{outcome.reference}</span>. Our
              team will contact you by phone, WhatsApp or email.
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-2xl font-semibold">Preview only: enquiries are not sent yet.</p>
            <p className="mt-4 leading-relaxed text-mist">
              On the live website this enquiry is saved, emailed to the team and tracked until it is answered. For now,
              send the same details on WhatsApp.
            </p>
          </>
        )}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-12 items-center gap-2.5 bg-[#1F7A4A] px-6 font-medium text-white hover:bg-[#25915a]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          {outcome.kind === "sent" ? "Also message us on WhatsApp" : "Send on WhatsApp"}
        </a>
        {outcome.kind === "preview" && (
          <button type="button" onClick={() => setOutcome({ kind: "editing" })} className="mt-4 block min-h-11 text-sm text-mist underline underline-offset-4 hover:text-accent">
            Edit enquiry
          </button>
        )}
      </div>
    );
  }

  const sending = outcome.kind === "sending";

  return (
    <form noValidate onSubmit={submit} className="relative border border-white/10 bg-ink/60 p-6 sm:p-10">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {service && <p className="mt-2 text-mist">Service: {service}</p>}
      <div className="mt-8 grid gap-5 md:grid-cols-2 [&>*]:min-w-0">
        <Field id={fid("name")} label="Your name" error={errors.name}>
          <input id={fid("name")} autoComplete="name" value={values.name} onChange={set("name")} className={field} aria-invalid={!!errors.name} aria-describedby={fid("name-err")} />
        </Field>
        <Field id={fid("company")} label="Company (optional)">
          <input id={fid("company")} autoComplete="organization" value={values.company} onChange={set("company")} className={field} />
        </Field>
        <Field id={fid("phone")} label="Phone" error={errors.phone}>
          <input id={fid("phone")} type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={set("phone")} className={field} aria-invalid={!!errors.phone} aria-describedby={fid("phone-err")} />
        </Field>
        <Field id={fid("email")} label="Email" error={errors.email}>
          <input id={fid("email")} type="email" autoComplete="email" value={values.email} onChange={set("email")} className={field} aria-invalid={!!errors.email} aria-describedby={fid("email-err")} />
        </Field>
        <Field id={fid("grade")} label="Steel grade">
          <select id={fid("grade")} value={values.grade} onChange={set("grade")} className={field}>
            <option value="">Not sure / other grade</option>
            {grades.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id={fid("quantity")} label="Quantity">
          <input id={fid("quantity")} placeholder="e.g. 4 pieces or 250 kg" value={values.quantity} onChange={set("quantity")} className={field} />
        </Field>
        <div className="md:col-span-2">
          <Field id={fid("dimensions")} label="Dimensions">
            <input id={fid("dimensions")} placeholder="e.g. Round 120 mm dia x 300 mm, or Flat 50 x 200 x 300 mm" value={values.dimensions} onChange={set("dimensions")} className={field} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field id={fid("message")} label="Message (optional)" error={errors.message}>
            <textarea id={fid("message")} rows={4} value={values.message} onChange={set("message")} className={field} aria-invalid={!!errors.message} aria-describedby={fid("message-err")} />
          </Field>
        </div>
        <FileField label="Drawing (PDF, DWG, DXF or image)" hint="Optional. Up to 20 MB." accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.webp" value={errors.drawing ? { file: null, error: errors.drawing } : drawing} onChange={setDrawing} />
        <FileField label="CAD file (STEP, DWG or DXF)" hint="Optional. Up to 20 MB." accept=".step,.stp,.dwg,.dxf" value={errors.cad ? { file: null, error: errors.cad } : cad} onChange={setCad} />
        {/* Spam trap: hidden from people and screen readers; bots tend to fill every field. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={fid("website")}>Website</label>
          <input id={fid("website")} tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </div>
      </div>
      {outcome.kind === "failed" && (
        <div role="alert" className="mt-8 border border-red-400/50 bg-red-400/5 p-5">
          <p className="text-surface">{outcome.message}</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-[#5BD47E] underline-offset-4 hover:underline">
            <WhatsAppIcon className="h-5 w-5" />
            Send the same details on WhatsApp
          </a>
        </div>
      )}
      <button
        type="submit"
        disabled={sending}
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center bg-accent px-8 font-medium text-ink transition-colors hover:bg-[#79B6EA] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {sending ? "Sending…" : "Send enquiry"}
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
