// Loads the approved Phase 1 content. Create-only: re-running never overwrites
// edits made later in the admin panel.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { categories } from "./seed-data/categories";
import { products } from "./seed-data/products";
import { services } from "./seed-data/services";
import { gallery, settings, timeline } from "./seed-data/site";

export async function seed(db: PrismaClient) {
  for (const c of categories) {
    await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const categoryIds = new Map((await db.category.findMany()).map((c) => [c.slug, c.id]));
  for (const [i, p] of products.entries()) {
    const { categorySlug, datasheets: _d, certificates: _c, ...data } = p;
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...data, order: i, categoryId: categoryIds.get(categorySlug)! },
    });
  }
  for (const [i, s] of services.entries()) {
    await db.service.upsert({ where: { slug: s.slug }, update: {}, create: { ...s, order: i } });
  }
  if ((await db.galleryItem.count()) === 0) {
    await db.galleryItem.createMany({
      data: gallery.map(({ id: _id, ...g }, i) => ({ ...g, order: i })),
    });
  }
  for (const [key, value] of Object.entries({ contact: settings, timeline })) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
}

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    await seed(db);
    console.log("Seed complete");
  } finally {
    await db.$disconnect();
  }
}

if (process.argv[1]?.endsWith("seed.ts")) main();
