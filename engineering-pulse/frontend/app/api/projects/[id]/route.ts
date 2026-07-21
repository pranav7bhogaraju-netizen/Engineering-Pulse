import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await getPool().query(
    `SELECT
       p.id, p.title, p.summary, p.difficulty, p.materials, p.instructions,
       p.source_url, p.source_name,
       COALESCE(array_agg(DISTINCT pd.domain_slug) FILTER (WHERE pd.domain_slug IS NOT NULL), '{}') AS domains
     FROM projects p
     LEFT JOIN project_domains pd ON p.id = pd.project_id
     WHERE p.id = $1
     GROUP BY p.id`,
    [params.id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ project: result.rows[0] });
}
