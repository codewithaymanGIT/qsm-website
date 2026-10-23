import { readFile } from "@/lib/server/file-store";
import { MEDIA_TYPES, isPublicMedia } from "@/lib/server/media";

/** Public media, served only while published content references it. Keys are content-unique, so cache hard. */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!(await isPublicMedia(key))) return new Response("Not found", { status: 404 });
  const body = await readFile("media", key);
  if (!body) return new Response("Not found", { status: 404 });
  const ext = key.split(".").pop()!;
  return new Response(body as BodyInit, {
    headers: {
      "content-type": MEDIA_TYPES[ext],
      "x-content-type-options": "nosniff",
      "cache-control": "public, max-age=31536000, immutable",
      ...(ext === "pdf" ? { "content-disposition": "inline" } : {}),
    },
  });
}
