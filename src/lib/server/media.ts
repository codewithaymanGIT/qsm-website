// Public site media (gallery photos, customer logos, datasheets, brochure, certificates).
// Stored outside public/ and served by /files/[key] only while published content uses them.
import "server-only";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { db } from "./db";
import { sniffFile } from "./file-check";
import { removeFiles, writeFile } from "./file-store";
import type { IncomingFile } from "./incoming";

export { mediaDir } from "./file-store";

export class MediaRejected extends Error {}

const RULES = {
  image: {
    exts: ["jpg", "jpeg", "png", "webp"],
    maxBytes: 8 * 1024 * 1024,
    label: "JPG, PNG or WEBP",
    size: "8 MB",
  },
  document: {
    exts: ["pdf"],
    maxBytes: 20 * 1024 * 1024,
    label: "PDF",
    size: "20 MB",
  },
} as const;

export type MediaKind = keyof typeof RULES;
export type StoredMedia = {
  key: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export async function storeMedia(file: IncomingFile, kind: MediaKind): Promise<StoredMedia> {
  try {
    return await keepMedia(file, kind);
  } finally {
    await file.discard?.();
  }
}

async function keepMedia(file: IncomingFile, kind: MediaKind): Promise<StoredMedia> {
  const rule = RULES[kind];
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
  if (!(rule.exts as readonly string[]).includes(ext)) throw new MediaRejected(`Upload a ${rule.label} file.`);
  if (file.size === 0) throw new MediaRejected("This file is empty.");
  if (file.size > rule.maxBytes) throw new MediaRejected(`Files must be ${rule.size} or smaller.`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniff = sniffFile(ext, bytes.subarray(0, 4096));
  if (!sniff.ok) throw new MediaRejected(sniff.reason);
  const key = `${randomUUID()}.${ext === "jpeg" ? "jpg" : ext}`;
  await writeFile("media", key, bytes, sniff.mime);
  return {
    key,
    fileName: path.basename(file.name).slice(-150),
    mimeType: sniff.mime,
    sizeBytes: bytes.length,
  };
}

export async function deleteMedia(key: string | null | undefined) {
  if (!key || key.startsWith("/")) return; // "/clients/…" logos ship with the site
  await removeFiles("media", [key]);
}

const KEY = /^[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/;

/** True only for a well-formed key referenced by a published row. */
export async function isPublicMedia(key: string): Promise<boolean> {
  if (!KEY.test(key)) return false;
  const [gallery, logo, download, cert, category, product, service] = await Promise.all([
    db.galleryItem.count({ where: { imageKey: key, published: true } }),
    db.partnerLogo.count({ where: { imageKey: key, published: true } }),
    db.download.count({ where: { fileKey: key, published: true } }),
    db.certificate.count({ where: { fileKey: key, published: true } }),
    db.category.count({ where: { imageKey: key } }),
    db.product.count({ where: { imageKey: key, published: true } }),
    db.service.count({ where: { imageKeys: { has: key }, published: true } }),
  ]);
  return gallery + logo + download + cert + category + product + service > 0;
}

export const MEDIA_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};
