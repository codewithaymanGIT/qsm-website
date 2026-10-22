"use client";

import { useId, useRef } from "react";
import { validateUpload } from "@/lib/upload-rules";

export type PickedFile = { file: File | null; error: string | null };

type Props = {
  label: string;
  hint: string;
  accept: string;
  value: PickedFile;
  onChange: (v: PickedFile) => void;
};

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function FileField({ label, hint, accept, value, onChange }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);

  function pick(file: File | undefined) {
    if (!file) return onChange({ file: null, error: null });
    const check = validateUpload(file.name, file.size);
    onChange(check.ok ? { file, error: null } : { file: null, error: check.reason });
    if (!check.ok && input.current) input.current.value = "";
  }

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm text-surface/80">
        {label}
      </label>
      <div
        className={`flex flex-wrap items-center gap-3 border border-dashed px-4 py-4 ${
          value.error ? "border-red-400/70" : "border-white/20"
        }`}
      >
        <input
          ref={input}
          id={id}
          type="file"
          accept={accept}
          aria-describedby={`${id}-hint`}
          aria-invalid={value.error ? true : undefined}
          onChange={(e) => pick(e.target.files?.[0])}
          className="w-full min-w-0 flex-1 text-sm text-mist file:mr-4 file:min-h-10 file:cursor-pointer file:border-0 file:bg-steel file:px-4 file:text-surface hover:file:bg-[#24467A]"
        />
        {value.file && (
          <button
            type="button"
            onClick={() => {
              if (input.current) input.current.value = "";
              onChange({ file: null, error: null });
            }}
            className="min-h-10 px-2 text-sm text-mist underline-offset-4 hover:text-accent hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      <p id={`${id}-hint`} className={`mt-2 text-sm ${value.error ? "text-red-300" : "text-mist"}`} role={value.error ? "alert" : undefined}>
        {value.error ?? (value.file ? `${value.file.name}, ${mb(value.file.size)}` : hint)}
      </p>
    </div>
  );
}
