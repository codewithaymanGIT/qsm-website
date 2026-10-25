// Content changes for databases that already exist (the live site was seeded earlier).
// Each update runs once (ids are recorded in the "contentUpdates" setting) and only fills
// in what is empty, so it never overwrites edits made in the admin.
import type { PrismaClient } from "../src/generated/prisma/client";

export const OFFICE_MAP_EMBED = "https://www.google.com/maps?q=18.8031369,73.7181113&z=16&output=embed";

export const GROUP_COMPANIES = [
  { name: "Kamal Forging Pvt Ltd", role: "Manufacturing unit (forging)", location: "158/11 Belilious Road, 1st Floor, Howrah, West Bengal 711101" },
  { name: "Powerpack Steel Industries Pvt Ltd", role: "Sister concern", location: "Bhilai, Chhattisgarh" },
];

/** The company's own photos (edited, with the QSM logo), shipped in public/photos/. */
const CATEGORY_PHOTOS = [
  "plastic-mould-steel",
  "hot-work-die-steel",
  "cold-work-tool-steel",
  "high-speed-steel",
  "en-series-engineering-steel",
  "alloy-steel",
  "mould-base-plates",
  "other-steel-grades",
];

const GALLERY_PHOTOS = [
  { key: "/photos/gallery-warehouse-plates.webp", label: "Plates and flats in stock", aspect: "landscape" },
  { key: "/photos/gallery-container-loading.webp", label: "Loading a container for dispatch", aspect: "portrait" },
  { key: "/photos/gallery-d2-round-bars.webp", label: "D2 (1.2379) round bars", aspect: "square" },
  { key: "/photos/gallery-d2-flats-container.webp", label: "D2 (1.2379) flats arriving by container", aspect: "landscape" },
  { key: "/photos/gallery-p20-blocks.webp", label: "P20 mould steel blocks", aspect: "landscape" },
];

type Json = Record<string, string | null>;

const UPDATES: { id: string; run: (db: PrismaClient) => Promise<void> }[] = [
  {
    id: "2026-10-25-company-photos",
    async run(db) {
      for (const slug of CATEGORY_PHOTOS) {
        await db.category.updateMany({ where: { slug, imageKey: null }, data: { imageKey: `/photos/category-${slug}.webp` } });
      }
      // Placeholder slots without a photo are hidden (kept in the admin as a shot list).
      await db.galleryItem.updateMany({ where: { imageKey: null }, data: { published: false } });
      for (const [i, g] of GALLERY_PHOTOS.entries()) {
        if (await db.galleryItem.count({ where: { imageKey: g.key } })) continue;
        await db.galleryItem.create({ data: { label: g.label, shot: g.label, aspect: g.aspect, imageKey: g.key, order: -100 + i } });
      }
    },
  },
  {
    id: "2026-10-25-owners-map-group",
    async run(db) {
      const contact = await db.setting.findUnique({ where: { key: "contact" } });
      if (contact) {
        const v = contact.value as Json;
        const value = {
          ...v,
          contactName: v.contactName === "Mohit Agrawal" ? "Hemant Bansal & Mitesh Bansal" : v.contactName,
          mapEmbedUrl: v.mapEmbedUrl || OFFICE_MAP_EMBED,
        };
        await db.setting.update({ where: { key: "contact" }, data: { value } });
      }
      const timeline = await db.setting.findUnique({ where: { key: "timeline" } });
      if (timeline) {
        const value = (timeline.value as Json[]).map((e) => ({ ...e, body: (e.body ?? "").replace("Hemant Agrawal", "Hemant Bansal") }));
        await db.setting.update({ where: { key: "timeline" }, data: { value } });
      }
      await db.setting.upsert({ where: { key: "groupCompanies" }, update: {}, create: { key: "groupCompanies", value: GROUP_COMPANIES } });
    },
  },
];

export async function applyContentUpdates(db: PrismaClient) {
  const row = await db.setting.findUnique({ where: { key: "contentUpdates" } });
  const done = new Set((row?.value as string[] | undefined) ?? []);
  for (const u of UPDATES) {
    if (done.has(u.id)) continue;
    await u.run(db);
    done.add(u.id);
    await db.setting.upsert({ where: { key: "contentUpdates" }, update: { value: [...done] }, create: { key: "contentUpdates", value: [...done] } });
    console.log(`Content update applied: ${u.id}`);
  }
}
