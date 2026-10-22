import { describe, expect, it } from "vitest";
import { sniffFile } from "@/lib/server/file-check";

const bytes = (...parts: (string | number[])[]) =>
  new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...Buffer.from(p, "latin1")] : p)));

describe("sniffFile", () => {
  it("accepts real files by their content", () => {
    expect(sniffFile("pdf", bytes("%PDF-1.7\n..."))).toEqual({ ok: true, mime: "application/pdf" });
    expect(sniffFile("png", bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]))).toMatchObject({ ok: true, mime: "image/png" });
    expect(sniffFile("jpg", bytes([0xff, 0xd8, 0xff, 0xe0]))).toMatchObject({ ok: true, mime: "image/jpeg" });
    expect(sniffFile("webp", bytes("RIFF", [1, 2, 3, 4], "WEBPVP8 "))).toMatchObject({ ok: true, mime: "image/webp" });
    expect(sniffFile("dwg", bytes("AC1032", [0, 0]))).toMatchObject({ ok: true });
    expect(sniffFile("step", bytes("ISO-10303-21;\nHEADER;"))).toMatchObject({ ok: true });
    expect(sniffFile("stp", bytes("﻿".replace("﻿", ""), "  ISO-10303-21;"))).toMatchObject({ ok: true });
    expect(sniffFile("dxf", bytes("  0\nSECTION\n  2\nHEADER\n"))).toMatchObject({ ok: true });
    expect(sniffFile("dxf", bytes("AutoCAD Binary DXF\r\n", [0x1a, 0]))).toMatchObject({ ok: true });
  });

  it("rejects a program renamed to .pdf", () => {
    const r = sniffFile("pdf", bytes("MZ", [0x90, 0, 3, 0]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/does not look like a PDF/);
  });

  it("rejects binary junk named .dxf", () => {
    expect(sniffFile("dxf", bytes([0, 1, 2, 3, 0xff, 0xfe])).ok).toBe(false);
  });

  it("rejects extensions outside the allow-list", () => {
    expect(sniffFile("exe", bytes("MZ")).ok).toBe(false);
  });
});
