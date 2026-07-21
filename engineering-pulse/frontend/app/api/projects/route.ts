import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const conditions: string[] = [];
  const values: string[] = [];
  if (domain && domain !== "all") {
    values.push(domain);
    conditions.push(`pd.domain_slug = $${values.length}`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // userId is appended last; its placeholder number depends on whether a
  // domain filter was added before it.
  values.push(userId ?? "");
  const userIdParam = `$${values.length}`;

  const query = `
    SELECT
      p.id, p.title, p.summary, p.difficulty, p.source_url, p.source_name,
      COALESCE(array_agg(DISTINCT pd.domain_slug) FILTER (WHERE pd.domain_slug IS NOT NULL), '{}') AS domains,
      COUNT(DISTINCT pv.user_id) AS vote_count,
      EXISTS(
        SELECT 1 FROM project_votes v
        WHERE v.project_id = p.id AND v.user_id::text = ${userIdParam}
      ) AS user_voted,
      EXISTS(
        SELECT 1 FROM saved_projects s
        WHERE s.project_id = p.id AND s.user_id::text = ${userIdParam}
      ) AS user_saved
    FROM projects p
    LEFT JOIN project_domains pd ON p.id = pd.project_id
    LEFT JOIN project_votes pv ON p.id = pv.project_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  try {
    const result = await getPool().query(query, values);
    return NextResponse.json({ projects: result.rows });
  } catch (error) {
    console.error("Projects query failed:", error);
    return NextResponse.json({ projects: [], error: "Could not load projects." }, { status: 500 });
  }
}
