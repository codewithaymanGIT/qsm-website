// One-off: label Bhilai Steel Plant with its parent company in existing databases (dev only). Safe to re-run.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  await db.partnerLogo.updateMany({ where: { name: "Bhilai Steel Plant" }, data: { name: "Bhilai Steel Plant (SAIL)" } });
  await db.$disconnect();
  console.log("SAIL label applied");
}

main();
