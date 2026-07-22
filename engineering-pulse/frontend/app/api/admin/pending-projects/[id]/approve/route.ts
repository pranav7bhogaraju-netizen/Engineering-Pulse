import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_DOMAINS = ["ee", "me", "ce", "aero", "chem", "materials", "biomed", "cs"];
const VALID_DIFFICULTY = ["beginner", "intermediate", "advanced"];
const VALID_LEVEL = ["fair", "collegiate"];

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { domains, difficulty, level } = await request.json();
  const cleanDomains = Array.isArray(domains)
    ? domains.filter((d: string) => VALID_DOMAINS.includes(d))
    : [];
  if (cleanDomains.length === 0) {
    return NextResponse.json({ error: "Select at least one domain." }, { status: 400 });
  }
  const diff = VALID_DIFFICULTY.includes(difficulty) ? difficulty : "intermediate";
  const lvl = VALID_LEVEL.includes(level) ? level : "collegiate";

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE projects SET status = 'published', difficulty = $1, level = $2
       WHERE id = $3 AND status = 'pending'`,
      [diff, lvl, params.id]
    );

    await client.query("DELETE FROM project_domains WHERE project_id = $1", [params.id]);
    for (const domain of cleanDomains) {
      await client.query(
        "INSERT INTO project_domains (project_id, domain_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [params.id, domain]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Approve pending project failed:", error);
    return NextResponse.json({ error: "Something went wrong approving this." }, { status: 500 });
  } finally {
    client.release();
  }

  return NextResponse.json({ success: true });
}
