import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Without this, Next.js tries to execute this route during the BUILD
// itself (to statically analyze/prerender it), which fails the whole
// build if DATABASE_URL isn't available at build time or the database
// is briefly unreachable. force-dynamic tells Next this route only ever
// runs at actual request time, never during build.
export const dynamic = "force-dynamic";

// Falls back to an empty list (rather than throwing) if the database has
// no items yet — e.g. before ingest.py has been run for the first time.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  const track = searchParams.get("track");

  const conditions: string[] = [];
  const values: string[] = [];

  if (domain && domain !== "all") {
    values.push(domain);
    conditions.push(`id.domain_slug = $${values.length}`);
  }
  if (track && track !== "all") {
    values.push(track);
    conditions.push(`items.track = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT
      items.id,
      items.title,
      items.url,
      items.summary,
      items.track,
      items.published_at,
      items.source_name AS source,
      COALESCE(item_scores.composite_score, 0) AS score,
      COALESCE(
        array_agg(DISTINCT id.domain_slug) FILTER (WHERE id.domain_slug IS NOT NULL),
        '{}'
      ) AS domains
    FROM items
    LEFT JOIN item_scores ON items.id = item_scores.item_id
    LEFT JOIN item_domains id ON items.id = id.item_id
    ${whereClause}
    GROUP BY items.id, item_scores.composite_score
    ORDER BY score DESC, items.published_at DESC
    LIMIT 60
  `;

  try {
    const result = await getPool().query(query, values);
    const items = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      url: row.url,
      source: row.source ?? "Unknown source",
      domains: row.domains ?? [],
      track: row.track,
      summary: row.summary ?? "",
      score: Number(row.score) || 0,
      publishedAt: row.published_at,
    }));
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Feed query failed:", error);
    return NextResponse.json(
      { items: [], error: "Could not load feed. Check DATABASE_URL and that ingest.py has run." },
      { status: 500 }
    );
  }
}
