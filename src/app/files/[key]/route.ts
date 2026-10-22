import fs from "node:fs/promises";
import path from "node:path";
import { MEDIA_TYPES, isPublicMedia, mediaDir } from "@/lib/server/media";

/** Public media, served only while published content references it. Keys are content-unique, so cache hard. */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!(await isPublicMedia(key))) return new Response("Not found", { status: 404 });
  const body = await fs.readFile(path.join(/*turbopackIgnore: true*/ mediaDir(), path.basename(key))).catch(() => null);
  if (!body) return new Response("Not found", { status: 404 });
  const ext = key.split(".").pop()!;
  return new Response(body, {
    headers: {
      "content-type": MEDIA_TYPES[ext],
      "x-content-type-options": "nosniff",
      "cache-control": "public, max-age=31536000, immutable",
      ...(ext === "pdf" ? { "content-disposition": "inline" } : {}),
    },
  });
}
