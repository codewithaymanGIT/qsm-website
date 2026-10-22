// Creates the first admin (or resets a user's password and makes them ADMIN).
// Usage: npm run admin:create -- you@example.com "Your Name"
// The password is read from ADMIN_PASSWORD or prompted for; there is never a default.
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/server/password";

async function main() {
  const [email, name] = process.argv.slice(2);
  if (!email || !name) throw new Error('Usage: npm run admin:create -- you@example.com "Your Name"');
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question("Password (min 12 characters): ");
    rl.close();
  }
  if (password.length < 12) throw new Error("Password must be at least 12 characters.");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  const passwordHash = await hashPassword(password);
  const user = await db.user.upsert({
    where: { email: email.trim().toLowerCase() },
    update: { passwordHash, role: "ADMIN", active: true, name },
    create: { email: email.trim().toLowerCase(), name, passwordHash, role: "ADMIN" },
  });
  // A password change signs out every existing session.
  await db.session.deleteMany({ where: { userId: user.id } });
  await db.$disconnect();
  console.log(`Admin ready: ${user.email}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
