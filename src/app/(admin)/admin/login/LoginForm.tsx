"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn, type SignInState } from "./actions";

const field = "w-full border border-white/15 bg-graphite px-4 py-3 text-base text-surface focus:border-accent focus:outline-none";

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "";
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { error: null });
  return (
    <form action={action} className="mt-10 space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-surface/80">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm text-surface/80">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={field} />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="min-h-12 w-full bg-accent font-medium text-ink hover:bg-[#79B6EA] disabled:opacity-70">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
