// Steel weight from shape and size. All lengths in mm, density in g/cm³, result in kg.

export type Size =
  | { shape: "round"; diameter: number; length: number }
  | { shape: "flat"; thickness: number; width: number; length: number }
  | { shape: "square"; side: number; length: number }
  | { shape: "hexagon"; acrossFlats: number; length: number }
  | { shape: "hollow"; outer: number; inner: number; length: number };

export type Shape = Size["shape"];

export const DEFAULT_DENSITY = 7.85;

/** Typical densities (g/cm³). High-chromium cold work grades are lighter than plain steel. */
const DENSITY: Record<string, number> = {
  p20: 7.85,
  "p20-ni": 7.85,
  h13: 7.8,
  h11: 7.8,
  skd61: 7.8,
  d2: 7.7,
  skd11: 7.7,
  hchcr: 7.7,
  ohns: 7.81,
};

export const densityFor = (gradeSlug: string) => DENSITY[gradeSlug] ?? DEFAULT_DENSITY;

const positive = (...n: number[]) => n.every((v) => Number.isFinite(v) && v > 0);

/** Cross-section area in mm², or null when the size is incomplete or impossible. */
function area(s: Size): number | null {
  switch (s.shape) {
    case "round":
      return positive(s.diameter) ? (Math.PI / 4) * s.diameter ** 2 : null;
    case "flat":
      return positive(s.thickness, s.width) ? s.thickness * s.width : null;
    case "square":
      return positive(s.side) ? s.side ** 2 : null;
    case "hexagon":
      return positive(s.acrossFlats) ? (Math.sqrt(3) / 2) * s.acrossFlats ** 2 : null;
    case "hollow":
      return positive(s.outer, s.inner) && s.inner < s.outer ? (Math.PI / 4) * (s.outer ** 2 - s.inner ** 2) : null;
  }
}

export function pieceWeightKg(size: Size, density: number): number | null {
  const a = area(size);
  if (a === null || !positive(size.length, density)) return null;
  // mm³ x g/cm³ = 1e-3 g = 1e-6 kg
  return a * size.length * density * 1e-6;
}

/** The size written the way buyers quote it, for the enquiry's Dimensions field. */
export function describeSize(s: Size): string {
  switch (s.shape) {
    case "round":
      return `Round ${s.diameter} mm dia x ${s.length} mm`;
    case "flat":
      return `Flat ${s.thickness} x ${s.width} x ${s.length} mm`;
    case "square":
      return `Square ${s.side} x ${s.side} x ${s.length} mm`;
    case "hexagon":
      return `Hexagon ${s.acrossFlats} mm A/F x ${s.length} mm`;
    case "hollow":
      return `Hollow ${s.outer} OD x ${s.inner} ID x ${s.length} mm`;
  }
}
