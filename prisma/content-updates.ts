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
  {
    id: "2026-10-25-office-bandsaw",
    async run(db) {
      // Seeded rows may hold no list at all (NULL), which an "is empty" filter does not match.
      const saw = await db.service.findUnique({ where: { slug: "bandsaw-cutting" } });
      if (saw && !(saw.imageKeys ?? []).length) {
        await db.service.update({ where: { id: saw.id }, data: { imageKeys: ["/photos/service-bandsaw-cutting.webp"] } });
      }
      const photos = [
        { key: "/photos/gallery-office-entrance.webp", label: "Our office entrance", aspect: "portrait", published: true },
        { key: "/photos/service-bandsaw-cutting.webp", label: "Bandsaw cutting a round bar", aspect: "landscape", published: true },
      ];
      for (const [i, g] of photos.entries()) {
        if (await db.galleryItem.count({ where: { imageKey: g.key } })) continue;
        await db.galleryItem.create({ data: { label: g.label, shot: g.label, aspect: g.aspect, imageKey: g.key, published: g.published, order: -50 + i } });
      }
    },
  },
  {
    id: "2026-10-25-service-photos",
    async run(db) {
      // Supplied by the client with permission; the grinding photo keeps its FineMetalworking.com credit.
      for (const slug of ["precision-machining", "surface-grinding", "custom-cutting"]) {
        const svc = await db.service.findUnique({ where: { slug } });
        if (svc && !(svc.imageKeys ?? []).length) {
          await db.service.update({ where: { id: svc.id }, data: { imageKeys: [`/photos/service-${slug}.webp`] } });
        }
      }
    },
  },
  {
    id: "2026-10-25-hot-work-photos",
    async run(db) {
      // The hot-work category card now uses the H13 photo (same file path, replaced in public/photos).
      const photos = [
        { key: "/photos/gallery-h13-blocks.webp", label: "H13 hot work blocks in stock", aspect: "portrait" },
        { key: "/photos/gallery-h11-blocks.webp", label: "H11 (1.2343) hot work blocks", aspect: "square" },
      ];
      for (const [i, g] of photos.entries()) {
        if (await db.galleryItem.count({ where: { imageKey: g.key } })) continue;
        await db.galleryItem.create({ data: { label: g.label, shot: g.label, aspect: g.aspect, imageKey: g.key, order: -75 + i } });
      }
    },
  },
  {
    id: "2026-10-25-mills-clients-count",
    async run(db) {
      // From the owner: mills he is a stockist for, and the client count.
      const mills = [
        { name: "NLMK Verona", imageKey: "/mills/nlmk-verona.png" },
        { name: "SeAH CSS", imageKey: "/mills/seah-css.png" },
        { name: "Böhler Edelstahl", imageKey: "/mills/bohler.png" },
        { name: "Daido Steel", imageKey: null, alsoKnownAs: ["Daido Metal"] },
        { name: "Tiangong", imageKey: null },
        { name: "GMTC", imageKey: "/mills/gmtc.png" },
      ];
      for (const [i, { alsoKnownAs = [], ...m }] of (mills as { name: string; imageKey: string | null; alsoKnownAs?: string[] }[]).entries()) {
        // Renamed later (Daido Steel → Daido Metal): a re-run must not add it back.
        if (await db.partnerLogo.count({ where: { name: { in: [m.name, ...alsoKnownAs] }, kind: "MILL" } })) continue;
        await db.partnerLogo.create({ data: { ...m, kind: "MILL", order: i } });
      }
      const contact = await db.setting.findUnique({ where: { key: "contact" } });
      if (contact) {
        const v = contact.value as Json;
        const value = { ...v, clientsCount: v.clientsCount || "1500+", millsHeading: v.millsHeading || "Authorized stockist" };
        await db.setting.update({ where: { key: "contact" }, data: { value } });
      }
    },
  },
  {
    id: "2026-10-26-tiangong-logo",
    async run(db) {
      await db.partnerLogo.updateMany({ where: { name: "Tiangong", kind: "MILL", imageKey: null }, data: { imageKey: "/mills/tiangong.png" } });
    },
  },
  {
    id: "2026-10-26-daido-logo",
    async run(db) {
      // The logo supplied reads "Daido Metal", so the tile's name (and alt text) matches it.
      await db.partnerLogo.updateMany({
        where: { name: "Daido Steel", kind: "MILL", imageKey: null },
        data: { name: "Daido Metal", imageKey: "/mills/daido.png" },
      });
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
