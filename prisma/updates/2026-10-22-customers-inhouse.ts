// One-off update for databases seeded before customers and in-house wording were confirmed (dev only). Safe to re-run.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { services } from "../seed-data/services";
import { partners } from "../seed-data/site";

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  for (const slug of ["precision-machining", "surface-grinding"]) {
    const s = services.find((x) => x.slug === slug)!;
    await db.service.update({ where: { slug }, data: { description: s.description } });
  }
  if ((await db.partnerLogo.count()) === 0) {
    await db.partnerLogo.createMany({ data: partners.map((p, i) => ({ name: p.name, order: i })) });
  }
  await db.$disconnect();
  console.log("Customers and in-house wording applied");
}

main();
