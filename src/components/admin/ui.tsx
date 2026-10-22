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
