import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to save resources." }, { status: 401 });
  }

  const pool = getPool();
  const existing = await pool.query(
    "SELECT 1 FROM saved_resources WHERE resource_id = $1 AND user_id = $2",
    [params.id, userId]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      "DELETE FROM saved_resources WHERE resource_id = $1 AND user_id = $2",
      [params.id, userId]
    );
    return NextResponse.json({ saved: false });
  } else {
    await pool.query(
      "INSERT INTO saved_resources (resource_id, user_id) VALUES ($1, $2)",
      [params.id, userId]
    );
    return NextResponse.json({ saved: true });
  }
}
