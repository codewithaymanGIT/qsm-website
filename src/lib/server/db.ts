import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  // Fail loudly: rendering pages without a database would silently show nothing.
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// One client per process (Next dev reloads modules; keep the pool across reloads).
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createClient> };
export const db = globalForDb.db ?? createClient();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
