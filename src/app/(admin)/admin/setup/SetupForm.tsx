"use client";

import { useActionState } from "react";
import { setUp, type SetupFormState } from "./actions";

const field = "w-full border border-white/15 bg-graphite px-4 py-3 text-base text-surface focus:border-accent focus:outline-none";

const FIELDS = [
  { name: "name", label: "Your name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "username" },
  { name: "password", label: "Password (at least 12 characters)", type: "password", autoComplete: "new-password" },
  { name: "token", label: "Setup token", type: "password", autoComplete: "off" },
];

export function SetupForm() {
  const [state, action, pending] = useActionState<SetupFormState, FormData>(setUp, { error: null });
  return (
    <form action={action} className="mt-10 space-y-5">
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={`setup-${f.name}`} className="mb-2 block text-sm text-surface/80">
            {f.label}
          </label>
          <input id={`setup-${f.name}`} name={f.name} type={f.type} autoComplete={f.autoComplete} required className={field} />
        </div>
      ))}
      {state.error && (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="min-h-12 w-full bg-accent font-medium text-ink hover:bg-[#79B6EA] disabled:opacity-70">
        {pending ? "Creating…" : "Create admin account"}
      </button>
    </form>
  );
}
