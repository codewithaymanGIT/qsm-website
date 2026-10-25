// Deploy step: fills a brand-new database with the starting catalogue (never once content
// exists, so nothing staff deleted comes back), then applies one-time content updates.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseUrl } from "../src/lib/database-url";
import { applyContentUpdates } from "../prisma/content-updates";
import { seed } from "../prisma/seed";

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl()! }) });
  try {
    if ((await db.category.count()) > 0) console.log("Database already has content; not seeding.");
    else {
      await seed(db);
      console.log("Empty database: starting content added.");
    }
    await applyContentUpdates(db);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
