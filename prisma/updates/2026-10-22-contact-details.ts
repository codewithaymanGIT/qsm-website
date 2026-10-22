// One-off update for databases seeded before the contact details arrived (dev only). Safe to re-run.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { settings } from "../seed-data/site";

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  const current = (await db.setting.findUniqueOrThrow({ where: { key: "contact" } })).value as Record<string, unknown>;
  const { phone, whatsapp, officeAddress } = settings;
  await db.setting.update({ where: { key: "contact" }, data: { value: { ...current, phone, whatsapp, officeAddress } } });
  await db.$disconnect();
  console.log("Contact details applied");
}

main();
