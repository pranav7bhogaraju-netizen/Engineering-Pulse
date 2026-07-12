import { Pool } from "pg";

// Reused across requests in the same server instance instead of opening a
// new connection every time — important on serverless (Vercel), where
// each cold start would otherwise spin up its own pool.
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

// IMPORTANT: this must stay lazy (a function called at request time), not
// a top-level `export const pool = new Pool(...)`. Next.js imports route
// files during the build itself to inspect their config, and a top-level
// throw (e.g. missing DATABASE_URL) would fail the entire build even
// though the route is never actually invoked at build time.
export function getPool(): Pool {
  if (globalThis._pgPool) return globalThis._pgPool;

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to frontend/.env.local for local " +
        "development, and to your Vercel project's Environment Variables " +
        "for the deployed site."
    );
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Neon's hosted Postgres
  });
  globalThis._pgPool = pool;
  return pool;
}
