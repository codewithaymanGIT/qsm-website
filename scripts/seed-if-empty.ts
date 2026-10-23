// Deploy step: fills a brand-new database with the starting catalogue. Does nothing once
// content exists, so it never brings back anything staff have deleted in the admin.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseUrl } from "../src/lib/database-url";
import { seed } from "../prisma/seed";

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl()! }) });
  try {
    if ((await db.category.count()) > 0) return console.log("Database already has content; not seeding.");
    await seed(db);
    console.log("Empty database: starting content added.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
