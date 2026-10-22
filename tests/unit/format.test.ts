import { describe, expect, it } from "vitest";
import { formatRange } from "@/lib/format";

describe("formatRange", () => {
  it("shows min – max with two decimals", () => {
    expect(formatRange(0.28, 0.4)).toBe("0.28 – 0.40");
  });
  it("shows an upper limit only", () => {
    expect(formatRange(undefined, 0.6)).toBe("≤ 0.60");
  });
  it("shows a lower limit only", () => {
    expect(formatRange(11, undefined)).toBe("≥ 11.00");
  });
  it("shows a dash when no value is known", () => {
    expect(formatRange()).toBe("—");
  });
});
