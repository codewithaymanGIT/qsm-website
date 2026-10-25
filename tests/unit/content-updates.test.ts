import { describe, expect, it } from "vitest";
import { applyContentUpdates, GROUP_COMPANIES, OFFICE_MAP_EMBED } from "../../prisma/content-updates";
import { db } from "@/lib/server/db";

const forgetApplied = () => db.setting.deleteMany({ where: { key: "contentUpdates" } });

describe("one-time content updates", () => {
  it("fills empty category photos, hides placeholder gallery slots and adds the photos once", async () => {
    await forgetApplied();
    await db.category.updateMany({ where: { slug: "alloy-steel" }, data: { imageKey: null } });
    await db.category.updateMany({ where: { slug: "cold-work-tool-steel" }, data: { imageKey: "admin-upload.png" } });
    await db.galleryItem.create({ data: { label: "Empty slot", shot: "x", imageKey: null } });
    await applyContentUpdates(db);
    await forgetApplied();
    await applyContentUpdates(db); // a second run must not duplicate anything

    const cat = (slug: string) => db.category.findFirstOrThrow({ where: { slug } });
    expect((await cat("alloy-steel")).imageKey).toBe("/photos/category-alloy-steel.webp");
    expect((await cat("cold-work-tool-steel")).imageKey).toBe("admin-upload.png"); // never overwritten
    expect(await db.galleryItem.count({ where: { imageKey: null, published: true } })).toBe(0);
    expect(await db.galleryItem.count({ where: { imageKey: "/photos/gallery-warehouse-plates.webp" } })).toBe(1);
  });

  it("sets the owners, the office map and the group companies", async () => {
    const contact = (await db.setting.findUniqueOrThrow({ where: { key: "contact" } })).value as Record<string, string>;
    expect(contact.contactName).toBe("Hemant Bansal & Mitesh Bansal");
    expect(contact.mapEmbedUrl).toBe(OFFICE_MAP_EMBED);
    expect((await db.setting.findUniqueOrThrow({ where: { key: "groupCompanies" } })).value).toEqual(GROUP_COMPANIES);
    expect(JSON.stringify((await db.setting.findUniqueOrThrow({ where: { key: "timeline" } })).value)).not.toContain("Agrawal");
  });

  it("skips updates already applied, so later admin edits survive a redeploy", async () => {
    await db.category.updateMany({ where: { slug: "alloy-steel" }, data: { imageKey: null } });
    await applyContentUpdates(db);
    expect((await db.category.findFirstOrThrow({ where: { slug: "alloy-steel" } })).imageKey).toBeNull();
  });
});
