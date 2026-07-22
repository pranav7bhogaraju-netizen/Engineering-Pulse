import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const result = await getPool().query(
    `SELECT
       p.id, p.title, p.summary, p.difficulty, p.level, p.materials, p.instructions,
       p.source_url, p.source_name,
       COALESCE(array_agg(DISTINCT pd.domain_slug) FILTER (WHERE pd.domain_slug IS NOT NULL), '{}') AS domains,
       COUNT(DISTINCT pv.user_id) AS vote_count,
       EXISTS(
         SELECT 1 FROM project_votes v
         WHERE v.project_id = p.id AND v.user_id::text = $2
       ) AS user_voted,
       EXISTS(
         SELECT 1 FROM saved_projects s
         WHERE s.project_id = p.id AND s.user_id::text = $2
       ) AS user_saved
     FROM projects p
     LEFT JOIN project_domains pd ON p.id = pd.project_id
     LEFT JOIN project_votes pv ON p.id = pv.project_id
     WHERE p.id = $1
     GROUP BY p.id`,
    [params.id, userId ?? ""]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ project: result.rows[0] });
}
