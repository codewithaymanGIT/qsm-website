import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { db } from "@/lib/server/db";
import { MediaRejected, isPublicMedia, mediaDir, storeMedia } from "@/lib/server/media";

const png = (name = "logo.png") => new File([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])], name, { type: "image/png" });
const pdf = (name = "datasheet.pdf") => new File([Buffer.from("%PDF-1.7\n")], name, { type: "application/pdf" });

describe("storeMedia", () => {
  it("stores an image under a random name outside public/", async () => {
    const m = await storeMedia(png("../../evil.png"), "image");
    expect(m.key).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(fs.existsSync(path.join(mediaDir(), m.key))).toBe(true);
    expect(mediaDir()).not.toContain(`${path.sep}public`);
    expect(m.mimeType).toBe("image/png");
  });

  it("accepts PDFs only where documents are expected", async () => {
    expect((await storeMedia(pdf(), "document")).key).toMatch(/\.pdf$/);
    await expect(storeMedia(pdf(), "image")).rejects.toBeInstanceOf(MediaRejected);
  });

  it("rejects SVG and disguised files", async () => {
    const svg = new File([Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')], "logo.svg");
    await expect(storeMedia(svg, "image")).rejects.toThrow(/JPG, PNG or WEBP/);
    const fake = new File([Buffer.from("MZ\x90\x00")], "photo.png");
    await expect(storeMedia(fake, "image")).rejects.toThrow(/does not look like/);
  });

  it("rejects images over 8 MB", async () => {
    const big = new File([new Uint8Array(8 * 1024 * 1024 + 1)], "big.png");
    await expect(storeMedia(big, "image")).rejects.toThrow(/8 MB/);
  });
});

describe("isPublicMedia", () => {
  it("serves only keys used by published content", async () => {
    const used = await storeMedia(png(), "image");
    const hidden = await storeMedia(png(), "image");
    const orphan = await storeMedia(png(), "image");
    await db.galleryItem.create({
      data: { label: "Rack", shot: "Rack", imageKey: used.key },
    });
    await db.galleryItem.create({
      data: {
        label: "Draft",
        shot: "Draft",
        imageKey: hidden.key,
        published: false,
      },
    });
    expect(await isPublicMedia(used.key)).toBe(true);
    expect(await isPublicMedia(hidden.key)).toBe(false);
    expect(await isPublicMedia(orphan.key)).toBe(false);
    expect(await isPublicMedia("../.env")).toBe(false);
  });
});
