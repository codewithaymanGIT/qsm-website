const two = (n: number) => n.toFixed(2);

/** Composition range in wt %, as printed on mill certificates. */
export function formatRange(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) return `${two(min)} – ${two(max)}`;
  if (max !== undefined) return `≤ ${two(max)}`;
  if (min !== undefined) return `≥ ${two(min)}`;
  return "—";
}
