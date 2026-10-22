// One-off: attach the shipped customer logos in existing databases (dev only). Safe to re-run.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { partners } from "../seed-data/site";

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  for (const p of partners) await db.partnerLogo.updateMany({ where: { name: p.name, imageKey: null }, data: { imageKey: p.src } });
  await db.$disconnect();
  console.log("Customer logos applied");
}

main();
