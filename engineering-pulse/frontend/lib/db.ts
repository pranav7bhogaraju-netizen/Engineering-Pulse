import { Pool } from "pg";

// Reused across requests in the same server instance instead of opening a
// new connection every time — important on serverless (Vercel), where
// each cold start would otherwise spin up its own pool.
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to frontend/.env.local for local " +
        "development, and to your Vercel project's Environment Variables " +
        "for the deployed site."
    );
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Neon's hosted Postgres
  });
}

export const pool = globalThis._pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  globalThis._pgPool = pool;
}
