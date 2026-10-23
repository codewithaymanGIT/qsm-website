import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { databaseUrl } from "@/lib/database-url";

function createClient() {
  const connectionString = databaseUrl();
  // Fail loudly: rendering pages without a database would silently show nothing.
  if (!connectionString) throw new Error("DATABASE_URL is not set (or is not a postgres:// address)");
  // Serverless hosts run many small copies of the site; keep each one's share of connections small.
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, max: process.env.VERCEL ? 3 : 10 }) });
}

// One client per process (Next dev reloads modules; keep the pool across reloads).
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createClient> };
export const db = globalForDb.db ?? createClient();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
