"use client";

import { useId, useState } from "react";
import { adminGhostButton, adminInput } from "./ui";

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  wide?: boolean;
  multiline?: boolean;
};

/**
 * Repeatable rows posted as prefix.0.field, prefix.1.field … (read by rows() on the server).
 * Inputs stay uncontrolled; names follow the row's current position.
 */
export function RowsEditor({
  prefix,
  fields,
  initial,
  addLabel,
  legend,
}: {
  prefix: string;
  fields: Field[];
  initial: Record<string, string | number | undefined>[];
  addLabel: string;
  legend: string;
}) {
  const uid = useId();
  const [rows, setRows] = useState(() => initial.map((r, i) => ({ id: i, values: r })));
  const [next, setNext] = useState(initial.length);

  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-sm text-surface/80">{legend}</legend>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={row.id} className="flex flex-wrap items-end gap-3 border border-white/10 p-3">
            {fields.map((f) => {
              const id = `${uid}-${row.id}-${f.key}`;
              const common = {
                id,
                name: `${prefix}.${i}.${f.key}`,
                defaultValue: row.values[f.key] === undefined ? "" : String(row.values[f.key]),
                placeholder: f.placeholder,
                className: adminInput,
              };
              return (
                <div key={f.key} className={f.wide ? "min-w-0 flex-[3_1_16rem]" : "min-w-0 flex-[1_1_7rem]"}>
                  <label htmlFor={id} className="mb-1 block text-xs text-mist">
                    {f.label}
                  </label>
                  {f.multiline ? <textarea rows={2} {...common} /> : <input {...common} />}
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))}
              className="min-h-10 px-2 text-sm text-mist hover:text-[#FF9C9C]"
              aria-label={`Remove row ${i + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`${adminGhostButton} mt-3`}
        onClick={() => {
          setRows((r) => [...r, { id: next, values: {} }]);
          setNext((n) => n + 1);
        }}
      >
        {addLabel}
      </button>
    </fieldset>
  );
}
