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

describe("whatsapp details", () => {
  it("fills dimensions and quantity when known", () => {
    expect(whatsappMessage("D2", { dimensions: "Flat 50 x 200 x 300", quantity: "2 pcs" })).toBe(
      "Hello, I would like a quotation for D2 Steel.\nDimensions: Flat 50 x 200 x 300\nQuantity: 2 pcs\nPlease contact me.",
    );
  });
});

describe("telHref", () => {
  it("dials the number without spaces", async () => {
    const { telHref } = await import("@/lib/whatsapp");
    expect(telHref("+91 92841 27584")).toBe("tel:+919284127584");
  });
});
