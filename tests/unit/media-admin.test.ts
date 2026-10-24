import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { db } from "@/lib/server/db";
import { mediaDir } from "@/lib/server/media";
import { addCertificate, addCustomer, addGalleryItem, replaceBrochure, setCategoryPhoto, setServicePhotos, updateGalleryItem } from "@/lib/server/media-admin";
import { getCategories, getServices } from "@/lib/content";

const png = () => new File([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])], "photo.png", { type: "image/png" });
const pdf = () => new File([Buffer.from("%PDF-1.7\n")], "file.pdf", { type: "application/pdf" });
const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};
const onDisk = (key: string | null) => !!key && fs.existsSync(path.join(mediaDir(), key));

describe("media admin", () => {
  it("replacing a gallery photo deletes the old file", async () => {
    await addGalleryItem(form({ label: "Bandsaw bay", aspect: "landscape" }), png());
    const item = await db.galleryItem.findFirstOrThrow({ where: { label: "Bandsaw bay" } });
    expect(onDisk(item.imageKey)).toBe(true);
    await updateGalleryItem(item.id, form({ label: "Bandsaw bay", aspect: "square", order: "3", published: "on" }), png());
    const after = await db.galleryItem.findUniqueOrThrow({ where: { id: item.id } });
    expect(after.imageKey).not.toBe(item.imageKey);
    expect(onDisk(item.imageKey)).toBe(false);
    expect(after).toMatchObject({ aspect: "square", order: 3, published: true });
  });

  it("rejects an unknown photo shape and a gallery item without a photo", async () => {
    await expect(addGalleryItem(form({ label: "X", aspect: "panorama" }), png())).rejects.toThrow(/photo shape/);
    await expect(addGalleryItem(form({ label: "X" }), null)).rejects.toThrow(/Choose a photo/);
  });

  it("keeps one brochure: a new upload replaces the old one", async () => {
    await replaceBrochure(form({ title: "Brochure 2025" }), pdf());
    const first = await db.download.findFirstOrThrow({ where: { kind: "BROCHURE" } });
    await replaceBrochure(form({ title: "Brochure 2026" }), pdf());
    const all = await db.download.findMany({ where: { kind: "BROCHURE" } });
    expect(all.map((d) => d.title)).toEqual(["Brochure 2026"]);
    expect(onDisk(first.fileKey)).toBe(false);
  });

  it("customers need a name; websites must be https", async () => {
    await expect(addCustomer(form({ name: "" }), null)).rejects.toThrow(/company name/);
    await expect(addCustomer(form({ name: "Acme", website: "javascript:alert(1)" }), null)).rejects.toThrow(/https/);
  });

  it("certificates need a title and a PDF", async () => {
    await expect(addCertificate(form({ title: "" }), pdf())).rejects.toThrow(/certificate name/);
    await expect(addCertificate(form({ title: "ISO 9001" }), null)).rejects.toThrow(/PDF/);
    await addCertificate(form({ title: "ISO 9001", validUntil: "2027-03-31" }), pdf());
    expect((await db.certificate.findFirstOrThrow({ where: { title: "ISO 9001" } })).validUntil?.toISOString()).toBe("2027-03-31T00:00:00.000Z");
  });

  it("sets, replaces and removes a category photo, deleting old files", async () => {
    const cat = await db.category.findFirstOrThrow({ where: { slug: "hot-work-die-steel" } });
    await setCategoryPhoto(cat.id, png(), false);
    const first = (await db.category.findUniqueOrThrow({ where: { id: cat.id } })).imageKey;
    expect((await getCategories()).find((c) => c.slug === cat.slug)?.image).toBe(`/files/${first}`);
    await setCategoryPhoto(cat.id, png(), false);
    const second = (await db.category.findUniqueOrThrow({ where: { id: cat.id } })).imageKey;
    expect(onDisk(first)).toBe(false);
    await setCategoryPhoto(cat.id, null, true);
    expect((await db.category.findUniqueOrThrow({ where: { id: cat.id } })).imageKey).toBeNull();
    expect(onDisk(second)).toBe(false);
  });

  it("keeps service photos in order and removes the right one", async () => {
    const svc = await db.service.findFirstOrThrow({ where: { slug: "bandsaw-cutting" } });
    await setServicePhotos(svc.id, [{ file: png(), remove: false }, { file: png(), remove: false }]);
    const [main, finished] = (await db.service.findUniqueOrThrow({ where: { id: svc.id } })).imageKeys;
    expect((await getServices()).find((x) => x.slug === svc.slug)?.images).toEqual([`/files/${main}`, `/files/${finished}`]);
    await setServicePhotos(svc.id, [{ file: null, remove: false }, { file: null, remove: true }]);
    expect((await db.service.findUniqueOrThrow({ where: { id: svc.id } })).imageKeys).toEqual([main]);
    expect(onDisk(finished)).toBe(false);
    await setServicePhotos(svc.id, [{ file: null, remove: true }, { file: null, remove: false }]);
  });
});
