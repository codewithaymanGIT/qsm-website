import type { ReactNode } from "react";

export function PageTitle({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      {actions}
    </div>
  );
}

export const card = "border border-white/10 bg-ink";
export const adminInput =
  "w-full border border-white/15 bg-graphite px-3 py-2.5 text-[15px] text-surface focus:border-accent focus:outline-none";
export const adminButton =
  "inline-flex min-h-10 items-center justify-center bg-accent px-5 text-[15px] font-medium text-ink hover:bg-[#79B6EA] disabled:opacity-60";
export const adminGhostButton =
  "inline-flex min-h-10 items-center justify-center border border-white/20 px-4 text-[15px] text-surface hover:border-accent hover:text-accent";

export function Loading() {
  return <p className="text-mist">Loading…</p>;
}

/** Labelled input. Pass `as="textarea"` for long text; `hint` explains the format. */
export function Field({
  label,
  name,
  defaultValue,
  hint,
  as,
  rows = 4,
  type = "text",
  required,
  idPrefix = "f",
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  hint?: string;
  as?: "textarea";
  rows?: number;
  type?: string;
  required?: boolean;
  /** Keeps ids unique when the same field appears in several forms on one page. */
  idPrefix?: string;
}) {
  const id = `${idPrefix}-${name}`;
  const common = { id, name, defaultValue: defaultValue ?? "", required, className: adminInput };
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm text-surface/80">
        {label}
      </label>
      {as === "textarea" ? <textarea rows={rows} {...common} /> : <input type={type} {...common} />}
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
    </div>
  );
}

export function FileField({
  idPrefix = "f",
  label,
  accept,
  hint,
  required,
  purpose,
}: {
  idPrefix?: string;
  label: string;
  accept: string;
  hint?: string;
  required?: boolean;
  /** Which upload rules apply (direct uploads on Vercel). */
  purpose: "image" | "document";
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={`${idPrefix}-file`} className="mb-1.5 block text-sm text-surface/80">
        {label}
      </label>
      <input id={`${idPrefix}-file`} name="file" type="file" accept={accept} required={required} data-purpose={purpose} className={`${adminInput} min-w-0`} />
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
    </div>
  );
}

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
export const PDF_ACCEPT = "application/pdf,.pdf";

export function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-[15px]">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#4C9BDF]" />
      {label}
    </label>
  );
}

/** A required tick box, so a delete always takes two deliberate clicks. */
export function ConfirmTick({ label = "Yes, delete it permanently" }: { label?: string }) {
  return (
    <label className="mt-4 flex items-center gap-2 text-sm">
      <input type="checkbox" required className="h-4 w-4 accent-[#FF9C9C]" />
      {label}
    </label>
  );
}

export const dangerButton =
  "inline-flex min-h-10 items-center justify-center border border-[#FF9C9C]/40 px-4 text-[15px] text-[#FF9C9C] hover:bg-[#FF9C9C]/10";
