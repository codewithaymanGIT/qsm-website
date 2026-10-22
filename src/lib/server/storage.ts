import "server-only";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { validateUpload } from "@/lib/upload-rules";
import { sniffFile } from "./file-check";

/** Private storage root. Never under public/: files are only served through authenticated routes. */
export const uploadDir = () => path.resolve(process.env.UPLOAD_DIR ?? "storage/uploads");

export type StoredUpload = {
  kind: "DRAWING" | "CAD";
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
};

export class UploadRejected extends Error {}

/** Keep only the base name, printable and short, for display to staff. */
function displayName(name: string) {
  const base = name.split(/[\\/]/).pop() ?? "file";
  return base.replace(/[^\w.\- ()]/g, "_").slice(-150) || "file";
}

export async function storeUpload(file: File, kind: StoredUpload["kind"]): Promise<StoredUpload> {
  const rule = validateUpload(file.name, file.size);
  if (!rule.ok) throw new UploadRejected(rule.reason);
  const ext = file.name.split(".").pop()!.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniff = sniffFile(ext, bytes.subarray(0, 4096));
  if (!sniff.ok) throw new UploadRejected(sniff.reason);

  // The stored name comes only from a random id and the allow-listed extension.
  const storedName = `${randomUUID()}.${ext}`;
  await fs.mkdir(uploadDir(), { recursive: true, mode: 0o750 });
  await fs.writeFile(path.join(uploadDir(), storedName), bytes, { mode: 0o640, flag: "wx" });
  return {
    kind,
    originalName: displayName(file.name),
    storedName,
    mimeType: sniff.mime,
    sizeBytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

export async function removeStored(names: string[]) {
  await Promise.all(names.map((n) => fs.rm(path.join(uploadDir(), path.basename(n)), { force: true })));
}
