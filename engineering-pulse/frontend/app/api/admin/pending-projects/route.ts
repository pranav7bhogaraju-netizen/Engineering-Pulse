import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const result = await getPool().query(
    `SELECT p.id, p.title, p.summary, p.source_url, p.difficulty, p.level, p.created_at,
            u.name AS submitted_by_name,
            COALESCE(array_agg(DISTINCT pd.domain_slug) FILTER (WHERE pd.domain_slug IS NOT NULL), '{}') AS domains
     FROM projects p
     LEFT JOIN users u ON p.submitted_by = u.id
     LEFT JOIN project_domains pd ON p.id = pd.project_id
     WHERE p.status = 'pending'
     GROUP BY p.id, u.name
     ORDER BY p.created_at ASC`
  );

  return NextResponse.json({ pending: result.rows });
}
