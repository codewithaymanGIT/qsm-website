"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import type { ActionResult } from "@/lib/action-result";
import { adminButton } from "./ui";

type Props = {
  action: (form: FormData) => Promise<ActionResult | void>;
  children: ReactNode;
  submitLabel?: string;
  /** Clear the fields after a successful save (forms that add a new item). */
  resetOnSuccess?: boolean;
  className?: string;
  submitClassName?: string;
};

/**
 * Runs a Server Action without React's automatic form reset, so typed values survive a
 * validation error, and shows the action's message next to the button.
 */
export function ActionForm({ action, children, submitLabel = "Save", resetOnSuccess, className, submitClassName }: Props) {
  const ref = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        start(async () => {
          const r = (await action(data)) ?? { ok: "Saved." };
          setResult(r);
          if (r.ok && resetOnSuccess) ref.current?.reset();
        });
      }}
    >
      {children}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={submitClassName ?? adminButton}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <p role="status" aria-live="polite" className={`text-sm ${result?.error ? "text-[#FF9C9C]" : "text-[#8FD49A]"}`}>
          {!pending && (result?.error ?? result?.ok)}
        </p>
      </div>
    </form>
  );
}
