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

  const conditions: string[] = ["r.status = 'published'"];
  const values: string[] = [];
  if (domain && domain !== "all") {
    values.push(domain);
    conditions.push(`rd.domain_slug = $${values.length}`);
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  // userId is appended last regardless of whether a domain filter is present,
  // so its placeholder number depends on how many values came before it.
  values.push(userId ?? "");
  const userIdParam = `$${values.length}`;

  const query = `
    SELECT
      r.id, r.title, r.url, r.description, r.resource_type, r.source, r.submitted_by,
      COALESCE(
        array_agg(DISTINCT rd.domain_slug) FILTER (WHERE rd.domain_slug IS NOT NULL),
        '{}'
      ) AS domains,
      COUNT(DISTINCT rv.user_id) AS vote_count,
      EXISTS(
        SELECT 1 FROM resource_votes v
        WHERE v.resource_id = r.id AND v.user_id::text = ${userIdParam}
      ) AS user_voted,
      EXISTS(
        SELECT 1 FROM saved_resources s
        WHERE s.resource_id = r.id AND s.user_id::text = ${userIdParam}
      ) AS user_saved
    FROM resources r
    LEFT JOIN resource_domains rd ON r.id = rd.resource_id
    LEFT JOIN resource_votes rv ON r.id = rv.resource_id
    ${whereClause}
    GROUP BY r.id
    ORDER BY vote_count DESC, r.created_at DESC
  `;

  try {
    const result = await getPool().query(query, values);
    return NextResponse.json({ resources: result.rows });
  } catch (error) {
    console.error("Resources query failed:", error);
    return NextResponse.json({ resources: [], error: "Could not load resources." }, { status: 500 });
  }
}
