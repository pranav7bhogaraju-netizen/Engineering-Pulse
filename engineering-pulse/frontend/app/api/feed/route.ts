import { NextRequest, NextResponse } from "next/server";
import { MOCK_ITEMS } from "@/lib/mockData";

// Swap this file's body for a Postgres query once db/schema.sql is live:
//   SELECT items.*, item_scores.composite_score
//   FROM items JOIN item_scores ON items.id = item_scores.item_id
//   JOIN item_domains ON items.id = item_domains.item_id
//   WHERE ($domain IS NULL OR item_domains.domain_slug = $domain)
//     AND ($track IS NULL OR items.track = $track)
//   ORDER BY item_scores.composite_score DESC LIMIT 30

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  const track = searchParams.get("track");

  let items = MOCK_ITEMS;
  if (domain && domain !== "all") {
    items = items.filter((item) => item.domains.includes(domain));
  }
  if (track && track !== "all") {
    items = items.filter((item) => item.track === track);
  }
  items = [...items].sort((a, b) => b.score - a.score);

  return NextResponse.json({ items });
}
