import { describe, expect, it } from "vitest";
import { DEFAULT_DENSITY, densityFor, describeSize, pieceWeightKg } from "@/lib/weight";

describe("pieceWeightKg", () => {
  it("matches standard steel weight tables", () => {
    // 100 mm round bar, 1 m long, 7.85 g/cm³: 61.65 kg
    expect(pieceWeightKg({ shape: "round", diameter: 100, length: 1000 }, 7.85)).toBeCloseTo(61.65, 2);
    // Flat 50 x 200 x 300 mm in D2 (7.70): 23.10 kg
    expect(pieceWeightKg({ shape: "flat", thickness: 50, width: 200, length: 300 }, 7.7)).toBeCloseTo(23.1, 2);
    expect(pieceWeightKg({ shape: "square", side: 50, length: 1000 }, 7.85)).toBeCloseTo(19.625, 3);
    // Hexagon 50 mm across flats, 1 m: 17.00 kg
    expect(pieceWeightKg({ shape: "hexagon", acrossFlats: 50, length: 1000 }, 7.85)).toBeCloseTo(16.996, 2);
    // Hollow bar 100 OD x 50 ID, 1 m: 46.24 kg
    expect(pieceWeightKg({ shape: "hollow", outer: 100, inner: 50, length: 1000 }, 7.85)).toBeCloseTo(46.24, 2);
  });

  it("returns null for incomplete or impossible sizes", () => {
    expect(pieceWeightKg({ shape: "round", diameter: 0, length: 1000 }, 7.85)).toBeNull();
    expect(pieceWeightKg({ shape: "round", diameter: Number.NaN, length: 1000 }, 7.85)).toBeNull();
    expect(pieceWeightKg({ shape: "hollow", outer: 50, inner: 60, length: 1000 }, 7.85)).toBeNull();
  });
});

describe("densityFor", () => {
  it("uses the grade's density, else general steel", () => {
    expect(densityFor("d2")).toBe(7.7);
    expect(densityFor("h13")).toBe(7.8);
    expect(densityFor("unknown")).toBe(DEFAULT_DENSITY);
    expect(DEFAULT_DENSITY).toBe(7.85);
  });
});

describe("describeSize", () => {
  it("writes the size the way buyers quote it", () => {
    expect(describeSize({ shape: "round", diameter: 120, length: 300 })).toBe("Round 120 mm dia x 300 mm");
    expect(describeSize({ shape: "flat", thickness: 50, width: 200, length: 300 })).toBe("Flat 50 x 200 x 300 mm");
    expect(describeSize({ shape: "hollow", outer: 100, inner: 50, length: 500 })).toBe("Hollow 100 OD x 50 ID x 500 mm");
  });
});
