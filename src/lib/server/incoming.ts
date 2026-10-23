// A file arriving with a form: either the File itself (normal server) or, on Vercel, the
// name of a file the browser already uploaded to Blob storage under incoming/ (Vercel
// refuses request bodies over 4.5 MB). Both are checked the same way before they are kept.
import "server-only";
import { del, get, head, list } from "@vercel/blob";

export type IncomingFile = {
  name: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
  /** Removes the temporary upload (no-op for a File). Called whether the file was kept or not. */
  discard?(): Promise<void>;
};

/** incoming/<uuid>/<file name>: the shape the browser is allowed to upload to. */
export const INCOMING_PATH = /^incoming\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[^/\\]{1,150}$/;

const MAX_INCOMING_BYTES = 20 * 1024 * 1024;

export async function blobIncoming(pathname: string): Promise<IncomingFile | null> {
  if (!INCOMING_PATH.test(pathname)) return null;
  const meta = await head(pathname).catch(() => null);
  if (!meta || meta.size > MAX_INCOMING_BYTES) {
    if (meta) await del(pathname).catch(() => {});
    return null;
  }
  return {
    name: pathname.split("/").pop()!,
    size: meta.size,
    async arrayBuffer() {
      const res = await get(pathname, { access: "private", useCache: false });
      if (!res || res.statusCode !== 200) throw new Error("Uploaded file could not be read.");
      return new Response(res.stream).arrayBuffer();
    },
    discard: () => del(pathname).catch(() => {}),
  };
}

/** The file in a form field: a File, or a Blob upload reference. Null when the field is empty. */
export async function incomingFile(form: FormData, key: string): Promise<IncomingFile | null> {
  const v = form.get(key);
  if (v instanceof File) return v.size > 0 ? v : null;
  if (typeof v === "string" && v.startsWith("incoming/")) return blobIncoming(v);
  return null;
}

/** Temporary uploads nobody claimed (form abandoned or rejected) are removed after a day. */
export async function sweepIncoming() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const { blobs } = await list({ prefix: "incoming/", limit: 100 });
  const stale = blobs.filter((b) => b.uploadedAt.getTime() < cutoff).map((b) => b.pathname);
  if (stale.length) await del(stale);
}
