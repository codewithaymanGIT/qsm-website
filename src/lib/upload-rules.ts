// Shared by the quote form (client-side check) and, in Phase 2, the upload API.
export const ALLOWED_EXTENSIONS = ["pdf", "dwg", "dxf", "step", "stp", "jpg", "jpeg", "png", "webp"] as const;
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export type UploadCheck = { ok: true } | { ok: false; reason: string };

export function validateUpload(name: string, size: number): UploadCheck {
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return { ok: false, reason: "Use PDF, DWG, DXF, STEP, JPG, PNG or WEBP files." };
  }
  if (size <= 0) return { ok: false, reason: "This file is empty. Choose another file." };
  if (size > MAX_UPLOAD_BYTES) return { ok: false, reason: "Files must be 20 MB or smaller." };
  return { ok: true };
}
