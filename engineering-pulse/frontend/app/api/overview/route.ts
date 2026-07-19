import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getPool().query(
      "SELECT track, sort_mode, summary, generated_at FROM feed_overviews"
    );
    // Nested as overviews[track][sort_mode] = { summary, generated_at }
    const overviews: Record<string, Record<string, { summary: string; generated_at: string }>> = {};
    for (const row of result.rows) {
      if (!overviews[row.track]) overviews[row.track] = {};
      overviews[row.track][row.sort_mode] = {
        summary: row.summary,
        generated_at: row.generated_at,
      };
    }
    return NextResponse.json({ overviews });
  } catch (error) {
    console.error("Overview query failed:", error);
    return NextResponse.json({ overviews: {} }, { status: 500 });
  }
}
