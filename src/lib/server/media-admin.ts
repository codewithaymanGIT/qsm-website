// Saving gallery photos, customer logos, the brochure and company certificates.
// Callers check the role first (adminAction).
import "server-only";
import { AdminInputError } from "./admin-content";
import { db } from "./db";
import { deleteMedia, storeMedia } from "./media";

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const order = (form: FormData) => Math.trunc(Number(str(form, "order")) || 0);
const ASPECTS = ["landscape", "portrait", "square"];

function aspect(form: FormData) {
  const a = str(form, "aspect") || "landscape";
  if (!ASPECTS.includes(a)) throw new AdminInputError("Choose a photo shape.");
  return a;
}

export async function addGalleryItem(form: FormData, file: File | null) {
  const label = str(form, "label");
  if (!label) throw new AdminInputError("Describe the photo in a few words (this is also read out to blind visitors).");
  if (!file) throw new AdminInputError("Choose a photo to upload.");
  const stored = await storeMedia(file, "image");
  const last = await db.galleryItem.aggregate({ _max: { order: true } });
  await db.galleryItem.create({
    data: {
      label,
      shot: label,
      aspect: aspect(form),
      imageKey: stored.key,
      order: (last._max.order ?? 0) + 1,
    },
  });
}

export async function updateGalleryItem(id: string, form: FormData, file: File | null) {
  const label = str(form, "label");
  if (!label) throw new AdminInputError("Describe the photo in a few words.");
  const item = await db.galleryItem.findUniqueOrThrow({ where: { id } });
  const stored = file ? await storeMedia(file, "image") : null;
  await db.galleryItem.update({
    where: { id },
    data: {
      label,
      aspect: aspect(form),
      order: order(form),
      published: form.get("published") === "on",
      ...(stored ? { imageKey: stored.key } : {}),
    },
  });
  if (stored) await deleteMedia(item.imageKey);
}

export async function deleteGalleryItem(id: string) {
  const item = await db.galleryItem.delete({ where: { id } });
  await deleteMedia(item.imageKey);
}

function website(form: FormData) {
  const w = str(form, "website");
  if (w && !/^https:\/\/[^\s]+$/.test(w)) throw new AdminInputError("Website must start with https://");
  return w || null;
}

export async function addCustomer(form: FormData, file: File | null) {
  const name = str(form, "name");
  if (!name) throw new AdminInputError("Enter the company name.");
  const stored = file ? await storeMedia(file, "image") : null;
  const last = await db.partnerLogo.aggregate({ _max: { order: true } });
  await db.partnerLogo.create({
    data: {
      name,
      website: website(form),
      imageKey: stored?.key ?? null,
      order: (last._max.order ?? 0) + 1,
    },
  });
}

export async function updateCustomer(id: string, form: FormData, file: File | null) {
  const name = str(form, "name");
  if (!name) throw new AdminInputError("Enter the company name.");
  const row = await db.partnerLogo.findUniqueOrThrow({ where: { id } });
  const stored = file ? await storeMedia(file, "image") : null;
  await db.partnerLogo.update({
    where: { id },
    data: {
      name,
      website: website(form),
      order: order(form),
      published: form.get("published") === "on",
      ...(stored ? { imageKey: stored.key } : {}),
    },
  });
  if (stored) await deleteMedia(row.imageKey);
}

export async function deleteCustomer(id: string) {
  const row = await db.partnerLogo.delete({ where: { id } });
  await deleteMedia(row.imageKey);
}

/** One brochure at a time: a new upload replaces the old file. */
export async function replaceBrochure(form: FormData, file: File | null) {
  if (!file) throw new AdminInputError("Choose a PDF to upload.");
  const stored = await storeMedia(file, "document");
  const old = await db.download.findMany({ where: { kind: "BROCHURE" } });
  await db.download.create({
    data: {
      kind: "BROCHURE",
      title: str(form, "title") || "Company brochure",
      fileKey: stored.key,
      fileName: stored.fileName,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
    },
  });
  await db.download.deleteMany({ where: { id: { in: old.map((d) => d.id) } } });
  await Promise.all(old.map((d) => deleteMedia(d.fileKey)));
}

export async function removeBrochure() {
  const old = await db.download.findMany({ where: { kind: "BROCHURE" } });
  await db.download.deleteMany({ where: { kind: "BROCHURE" } });
  await Promise.all(old.map((d) => deleteMedia(d.fileKey)));
}

export async function addCertificate(form: FormData, file: File | null) {
  const title = str(form, "title");
  if (!title) throw new AdminInputError("Enter the certificate name, e.g. ISO 9001:2015.");
  if (!file) throw new AdminInputError("Choose the certificate file (PDF).");
  const until = str(form, "validUntil");
  const validUntil = until ? new Date(`${until}T00:00:00Z`) : null;
  if (validUntil && Number.isNaN(validUntil.getTime())) throw new AdminInputError("Enter a valid expiry date.");
  const stored = await storeMedia(file, "document");
  await db.certificate.create({
    data: {
      title,
      issuer: str(form, "issuer") || null,
      validUntil,
      fileKey: stored.key,
      fileName: stored.fileName,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
    },
  });
}

export async function deleteCertificate(id: string) {
  const row = await db.certificate.delete({ where: { id } });
  await deleteMedia(row.fileKey);
}
