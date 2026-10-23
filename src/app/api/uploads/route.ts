import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { rolesFor } from "@/components/admin/nav";
import { ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES } from "@/lib/upload-rules";
import { getCurrentUser } from "@/lib/server/auth";
import { INCOMING_PATH } from "@/lib/server/incoming";
import { overLimit } from "@/lib/server/rate-limit";

// Hands the browser a short-lived permission to upload ONE file straight to Blob storage
// (Vercel only). The file lands under incoming/ and is checked again when the form is sent.
const PURPOSES: Record<string, { exts: readonly string[]; maxBytes: number; staff: boolean }> = {
  enquiry: { exts: ALLOWED_EXTENSIONS, maxBytes: MAX_UPLOAD_BYTES, staff: false },
  image: { exts: ["jpg", "jpeg", "png", "webp"], maxBytes: 8 * 1024 * 1024, staff: true },
  document: { exts: ["pdf"], maxBytes: 20 * 1024 * 1024, staff: true },
};

class Refused extends Error {}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: "Direct uploads are not enabled." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return Response.json({ error: "Bad request." }, { status: 400 });
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const rule = clientPayload && Object.hasOwn(PURPOSES, clientPayload) ? PURPOSES[clientPayload] : undefined;
        if (!rule) throw new Refused("Unknown upload.");
        if (!INCOMING_PATH.test(pathname)) throw new Refused("Bad file name.");
        const ext = pathname.includes(".") ? pathname.split(".").pop()!.toLowerCase() : "";
        if (!rule.exts.includes(ext)) throw new Refused("This file type is not accepted.");
        if (rule.staff) {
          const user = await getCurrentUser();
          if (!user || !rolesFor("/admin/gallery/").includes(user.role)) throw new Refused("Sign in required.");
        } else {
          const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
          if (await overLimit(`upload:${ip}`, 10, 10 * 60 * 1000)) throw new Refused("Too many uploads. Please wait a few minutes.");
        }
        return { maximumSizeInBytes: rule.maxBytes, addRandomSuffix: false, allowOverwrite: false };
      },
    });
    return Response.json(result);
  } catch (e) {
    const message = e instanceof Refused ? e.message : "Upload could not start.";
    if (!(e instanceof Refused)) console.error("Upload token failed", e);
    return Response.json({ error: message }, { status: e instanceof Refused ? 403 : 500 });
  }
}
