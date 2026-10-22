import { describe, expect, it } from "vitest";
import { ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES, validateUpload } from "@/lib/upload-rules";

describe("validateUpload", () => {
  it("accepts every allowed type, case-insensitively", () => {
    for (const ext of ALLOWED_EXTENSIONS) expect(validateUpload(`part.${ext.toUpperCase()}`, 1)).toEqual({ ok: true });
  });
  it("covers the agreed file types", () => {
    expect([...ALLOWED_EXTENSIONS].sort()).toEqual(
      ["dwg", "dxf", "jpeg", "jpg", "pdf", "png", "step", "stp", "webp"].sort(),
    );
  });
  it("rejects other types and names the allowed ones", () => {
    const r = validateUpload("setup.exe", 10);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/PDF, DWG, DXF, STEP/);
  });
  it("rejects files without an extension", () => {
    expect(validateUpload("drawing", 10).ok).toBe(false);
  });
  it("rejects files over 20 MB", () => {
    expect(MAX_UPLOAD_BYTES).toBe(20 * 1024 * 1024);
    expect(validateUpload("a.pdf", MAX_UPLOAD_BYTES).ok).toBe(true);
    const r = validateUpload("a.pdf", MAX_UPLOAD_BYTES + 1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/20 MB/);
  });
  it("rejects empty files", () => {
    expect(validateUpload("a.pdf", 0).ok).toBe(false);
  });
});
