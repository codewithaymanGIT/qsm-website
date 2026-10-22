"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { describeSize, pieceWeightKg, type Shape, type Size } from "@/lib/weight";

type Grade = { slug: string; name: string };

const SHAPES: { id: Shape; label: string; fields: { key: string; label: string }[] }[] = [
  { id: "round", label: "Round bar", fields: [{ key: "diameter", label: "Diameter (mm)" }] },
  {
    id: "flat",
    label: "Flat / block / plate",
    fields: [
      { key: "thickness", label: "Thickness (mm)" },
      { key: "width", label: "Width (mm)" },
    ],
  },
  { id: "square", label: "Square bar", fields: [{ key: "side", label: "Side (mm)" }] },
  { id: "hexagon", label: "Hexagon bar", fields: [{ key: "acrossFlats", label: "Across flats (mm)" }] },
  {
    id: "hollow",
    label: "Hollow bar",
    fields: [
      { key: "outer", label: "Outer diameter (mm)" },
      { key: "inner", label: "Inner diameter (mm)" },
    ],
  },
];

const kg = (n: number) => `${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;

const input =
  "w-full border border-white/15 bg-graphite px-4 py-3 text-base text-surface tabular-nums transition-colors focus:border-accent focus:outline-none";

/** Reads ?grade= from the address; must sit inside a Suspense boundary. */
export function WeightCalculatorFromUrl({ grades }: { grades: Grade[] }) {
  const fromUrl = useSearchParams().get("grade") ?? "";
  return <WeightCalculator key={fromUrl} grades={grades} defaultGrade={grades.some((g) => g.slug === fromUrl) ? fromUrl : ""} />;
}

export function WeightCalculator({ grades, defaultGrade = "" }: { grades: Grade[]; defaultGrade?: string }) {
  const uid = useId();
  const [grade, setGrade] = useState(defaultGrade);
  const [shape, setShape] = useState<Shape>("round");
  const [dims, setDims] = useState<Record<string, string>>({});
  const [pieces, setPieces] = useState("1");

  const spec = SHAPES.find((s) => s.id === shape)!;
  const num = (k: string) => Number(dims[k]);
  const size = { shape, length: num("length"), ...Object.fromEntries(spec.fields.map((f) => [f.key, num(f.key)])) } as Size;
  const each = pieceWeightKg(size);
  const count = Math.max(1, Math.floor(Number(pieces) || 1));
  const total = each === null ? null : each * count;

  const quoteHref =
    total === null
      ? null
      : `/quote/?${new URLSearchParams({
          ...(grade ? { grade } : {}),
          dimensions: describeSize(size),
          quantity: `${count} pcs (approx. ${total.toFixed(2)} kg)`,
        })}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
      <div className="border border-white/10 bg-ink/60 p-6 sm:p-10">
        <div>
          <label htmlFor={`${uid}-grade`} className="mb-2 block text-sm text-surface/80">
            Steel grade
          </label>
          <select id={`${uid}-grade`} value={grade} onChange={(e) => setGrade(e.target.value)} className={input}>
            <option value="">Any grade</option>
            {grades.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="mt-8">
          <legend className="mb-3 text-sm text-surface/80">Shape</legend>
          <div className="flex flex-wrap gap-2">
            {SHAPES.map((s) => (
              <label
                key={s.id}
                className={`inline-flex min-h-11 cursor-pointer items-center border px-4 text-[15px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                  shape === s.id ? "border-accent bg-accent text-ink" : "border-white/15 text-surface/80 hover:border-accent"
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-shape`}
                  value={s.id}
                  checked={shape === s.id}
                  onChange={() => setShape(s.id)}
                  className="sr-only"
                />
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {[...spec.fields, { key: "length", label: "Length (mm)" }].map((f) => (
            <div key={f.key}>
              <label htmlFor={`${uid}-${f.key}`} className="mb-2 block text-sm text-surface/80">
                {f.label}
              </label>
              <input
                id={`${uid}-${f.key}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={dims[f.key] ?? ""}
                onChange={(e) => setDims((d) => ({ ...d, [f.key]: e.target.value }))}
                className={input}
              />
            </div>
          ))}
          <div>
            <label htmlFor={`${uid}-pieces`} className="mb-2 block text-sm text-surface/80">
              Pieces
            </label>
            <input id={`${uid}-pieces`} type="number" inputMode="numeric" min="1" step="1" value={pieces} onChange={(e) => setPieces(e.target.value)} className={input} />
          </div>
        </div>
      </div>

      <div role="status" aria-live="polite" className="self-start border border-accent/40 bg-graphite p-8 sm:p-10">
        <p className="text-sm text-mist">Weight per piece</p>
        <p className="mt-1 font-display text-[clamp(2.5rem,5vw,4rem)] leading-none font-semibold tracking-tight tabular-nums">
          {each === null ? "—" : kg(each)}
        </p>
        <p className="mt-8 text-sm text-mist">Total for {count} {count === 1 ? "piece" : "pieces"}</p>
        <p className="mt-1 font-display text-3xl font-semibold text-accent tabular-nums">{total === null ? "—" : kg(total)}</p>
        <p className="mt-8 text-sm leading-relaxed text-mist">Approximate weight. Final weight is confirmed at dispatch.</p>
        {quoteHref ? (
          <Link href={quoteHref} className="mt-8 inline-flex min-h-12 w-full items-center justify-center bg-accent px-6 font-medium text-ink transition-colors hover:bg-[#79B6EA]">
            Request a quote for this
          </Link>
        ) : (
          <p className="mt-8 text-sm text-mist">Enter the size to see the weight.</p>
        )}
      </div>
    </div>
  );
}
