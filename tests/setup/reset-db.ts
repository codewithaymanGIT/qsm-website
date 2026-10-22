// CLI wrapper so Playwright's setup can reset the test database (its loader can't import the Prisma client).
import { resetTestDatabase } from "./global";

resetTestDatabase(process.argv[2]).catch((e) => {
  console.error(e);
  process.exit(1);
});
