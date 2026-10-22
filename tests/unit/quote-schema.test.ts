import { describe, expect, it } from "vitest";
import { quoteSchema } from "@/lib/quote-schema";

const valid = {
  name: "Ravi Kumar",
  company: "",
  phone: "+91 98200 00000",
  email: "ravi@example.com",
  grade: "h13",
  dimensions: "Round 120 mm x 300 mm",
  quantity: "4 pieces",
  message: "",
};

describe("quoteSchema", () => {
  it("accepts a complete enquiry with an optional company left blank", () => {
    expect(quoteSchema.safeParse(valid).success).toBe(true);
  });
  it("requires a phone number with at least 10 digits", () => {
    const r = quoteSchema.safeParse({ ...valid, phone: "123" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["phone"]);
  });
  it("requires name and a valid email", () => {
    expect(quoteSchema.safeParse({ ...valid, name: " " }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...valid, email: "ravi@" }).success).toBe(false);
  });
  it("limits the message to 2000 characters", () => {
    expect(quoteSchema.safeParse({ ...valid, message: "x".repeat(2001) }).success).toBe(false);
  });
});
