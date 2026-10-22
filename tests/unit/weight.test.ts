import { describe, expect, it } from "vitest";
import { DENSITY, describeSize, pieceWeightKg } from "@/lib/weight";

describe("pieceWeightKg", () => {
  it("calculates every steel at the company's standard 8.0 g/cm³", () => {
    expect(DENSITY).toBe(8);
    // 100 mm round bar, 1 m long: 62.83 kg
    expect(pieceWeightKg({ shape: "round", diameter: 100, length: 1000 })).toBeCloseTo(62.83, 2);
    expect(pieceWeightKg({ shape: "flat", thickness: 50, width: 200, length: 300 })).toBeCloseTo(24.0, 2);
    expect(pieceWeightKg({ shape: "square", side: 50, length: 1000 })).toBeCloseTo(20.0, 2);
    expect(pieceWeightKg({ shape: "hexagon", acrossFlats: 50, length: 1000 })).toBeCloseTo(17.32, 2);
    expect(pieceWeightKg({ shape: "hollow", outer: 100, inner: 50, length: 1000 })).toBeCloseTo(47.12, 2);
  });

  it("returns null for incomplete or impossible sizes", () => {
    expect(pieceWeightKg({ shape: "round", diameter: 0, length: 1000 })).toBeNull();
    expect(pieceWeightKg({ shape: "round", diameter: Number.NaN, length: 1000 })).toBeNull();
    expect(pieceWeightKg({ shape: "hollow", outer: 50, inner: 60, length: 1000 })).toBeNull();
  });
});

describe("describeSize", () => {
  it("writes the size the way buyers quote it", () => {
    expect(describeSize({ shape: "round", diameter: 120, length: 300 })).toBe("Round 120 mm dia x 300 mm");
    expect(describeSize({ shape: "flat", thickness: 50, width: 200, length: 300 })).toBe("Flat 50 x 200 x 300 mm");
    expect(describeSize({ shape: "hollow", outer: 100, inner: 50, length: 500 })).toBe("Hollow 100 OD x 50 ID x 500 mm");
  });
});
