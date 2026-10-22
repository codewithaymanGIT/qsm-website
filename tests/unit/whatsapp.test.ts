import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, whatsappMessage } from "@/lib/whatsapp";

describe("whatsapp", () => {
  it("builds the agreed message for a grade", () => {
    expect(whatsappMessage("H13")).toBe(
      "Hello, I would like a quotation for H13 Steel.\nDimensions:\nQuantity:\nPlease contact me.",
    );
  });

  it("falls back to a generic message", () => {
    expect(whatsappMessage()).toBe(
      "Hello, I would like a quotation for steel.\nDimensions:\nQuantity:\nPlease contact me.",
    );
  });

  it("strips formatting from the number and encodes + in grade names", () => {
    const url = buildWhatsAppUrl("+91 98200 00000", "P20+Ni");
    expect(url.startsWith("https://wa.me/919820000000?text=")).toBe(true);
    expect(url).toContain("P20%2BNi");
  });

  it("still opens WhatsApp when the number is not set yet", () => {
    expect(buildWhatsAppUrl("[WHATSAPP]", "H13").startsWith("https://wa.me/?text=")).toBe(true);
  });
});
