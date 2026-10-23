// Hosting providers name the connection string differently (Neon, Prisma Postgres, plain
// Postgres). The app needs a standard postgres:// address; pick the first one that is.
const isPostgres = (u: string | undefined): u is string => !!u && /^postgres(ql)?:\/\//.test(u);

/** For the running site (a pooled address is fine). */
export function databaseUrl(): string | undefined {
  const env = process.env;
  return [env.DATABASE_URL, env.POSTGRES_URL, env.DATABASE_URL_UNPOOLED, env.POSTGRES_URL_NON_POOLING].find(isPostgres);
}

/** For migrations, which need a direct (unpooled) connection where the provider offers one. */
export function migrationUrl(): string | undefined {
  const env = process.env;
  return [env.DATABASE_URL_UNPOOLED, env.POSTGRES_URL_NON_POOLING].find(isPostgres) ?? databaseUrl();
}
