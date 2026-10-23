import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { validateUpload } from "@/lib/upload-rules";
import { sniffFile } from "./file-check";
import { removeFiles, writeFile } from "./file-store";
import type { IncomingFile } from "./incoming";

/** Private storage root (local disk). Never under public/: files are only served through authenticated routes. */
export { uploadDir } from "./file-store";

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

export async function storeUpload(file: IncomingFile, kind: StoredUpload["kind"]): Promise<StoredUpload> {
  try {
    return await keepUpload(file, kind);
  } finally {
    await file.discard?.();
  }
}

async function keepUpload(file: IncomingFile, kind: StoredUpload["kind"]): Promise<StoredUpload> {
  const rule = validateUpload(file.name, file.size);
  if (!rule.ok) throw new UploadRejected(rule.reason);
  const ext = file.name.split(".").pop()!.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniff = sniffFile(ext, bytes.subarray(0, 4096));
  if (!sniff.ok) throw new UploadRejected(sniff.reason);

  // The stored name comes only from a random id and the allow-listed extension.
  const storedName = `${randomUUID()}.${ext}`;
  await writeFile("uploads", storedName, bytes, sniff.mime);
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
  await removeFiles("uploads", names);
}
