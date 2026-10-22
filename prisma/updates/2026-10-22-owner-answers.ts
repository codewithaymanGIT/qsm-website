// One-off content update for databases seeded before the owner's answers (dev only;
// fresh databases get these values from the seed). Safe to re-run.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { products } from "../seed-data/products";
import { services } from "../seed-data/services";
import { settings, timeline } from "../seed-data/site";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const hchcr = products.find((p) => p.slug === "hchcr")!;
const machining = services.find((s) => s.slug === "precision-machining")!;

async function main() {
  await db.product.update({ where: { slug: "hchcr" }, data: { overview: hchcr.overview, equivalents: hchcr.equivalents } });
  await db.service.update({ where: { slug: "precision-machining" }, data: { description: machining.description } });
  await db.setting.update({ where: { key: "timeline" }, data: { value: timeline } });
  const contact = (await db.setting.findUniqueOrThrow({ where: { key: "contact" } })).value as Record<string, unknown>;
  await db.setting.update({ where: { key: "contact" }, data: { value: { ...contact, email: settings.email } } });
  await db.$disconnect();
  console.log("Owner answers applied");
}

main();
