// On Vercel (Blob store connected at build time) the browser uploads files straight to
// storage, because Vercel refuses request bodies over 4.5 MB; the form then sends only the
// stored file's name. Elsewhere files travel with the form as usual.
export const DIRECT_UPLOADS = process.env.NEXT_PUBLIC_DIRECT_UPLOADS === "1";

export type UploadPurpose = "enquiry" | "image" | "document";

export class DirectUploadError extends Error {}

/** Uploads to incoming/<uuid>/<name> and returns that path, which the server checks before keeping it. */
export async function uploadDirect(file: File, purpose: UploadPurpose): Promise<string> {
  const { upload } = await import("@vercel/blob/client");
  const name = (file.name.split(/[\\/]/).pop() ?? "file").replace(/[^\w.\- ()]/g, "_").slice(-150) || "file";
  try {
    const blob = await upload(`incoming/${crypto.randomUUID()}/${name}`, file, {
      access: "private",
      handleUploadUrl: "/api/uploads/",
      clientPayload: purpose,
      multipart: file.size > 5 * 1024 * 1024,
    });
    return blob.pathname;
  } catch (e) {
    console.error(e);
    throw new DirectUploadError(`“${file.name}” could not be uploaded. Check the file type and size, then try again.`);
  }
}
