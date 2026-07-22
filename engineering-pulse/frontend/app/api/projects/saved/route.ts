import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const query = `
    SELECT
      p.id, p.title, p.summary, p.difficulty, p.level, p.source_url, p.source_name,
      COALESCE(
        array_agg(DISTINCT pd.domain_slug) FILTER (WHERE pd.domain_slug IS NOT NULL),
        '{}'
      ) AS domains,
      COUNT(DISTINCT pv.user_id) AS vote_count,
      EXISTS(
        SELECT 1 FROM project_votes v
        WHERE v.project_id = p.id AND v.user_id = $1
      ) AS user_voted,
      TRUE AS user_saved
    FROM saved_projects sp
    JOIN projects p ON sp.project_id = p.id
    LEFT JOIN project_domains pd ON p.id = pd.project_id
    LEFT JOIN project_votes pv ON p.id = pv.project_id
    WHERE sp.user_id = $1
    GROUP BY p.id, sp.created_at
    ORDER BY sp.created_at DESC
  `;

  const result = await getPool().query(query, [userId]);
  return NextResponse.json({ projects: result.rows });
}
