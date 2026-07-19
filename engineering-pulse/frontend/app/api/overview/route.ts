import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getPool().query(
      "SELECT track, summary, generated_at FROM feed_overviews"
    );
    const overviews: Record<string, { summary: string; generated_at: string }> = {};
    for (const row of result.rows) {
      overviews[row.track] = { summary: row.summary, generated_at: row.generated_at };
    }
    return NextResponse.json({ overviews });
  } catch (error) {
    console.error("Overview query failed:", error);
    return NextResponse.json({ overviews: {} }, { status: 500 });
  }
}
