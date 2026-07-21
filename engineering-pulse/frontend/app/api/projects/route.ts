import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  const conditions: string[] = [];
  const values: string[] = [];
  if (domain && domain !== "all") {
    values.push(domain);
    conditions.push(`pd.domain_slug = $${values.length}`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT
      p.id, p.title, p.summary, p.difficulty, p.source_url, p.source_name,
      COALESCE(array_agg(DISTINCT pd.domain_slug) FILTER (WHERE pd.domain_slug IS NOT NULL), '{}') AS domains
    FROM projects p
    LEFT JOIN project_domains pd ON p.id = pd.project_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  const result = await getPool().query(query, values);
  return NextResponse.json({ projects: result.rows });
}
