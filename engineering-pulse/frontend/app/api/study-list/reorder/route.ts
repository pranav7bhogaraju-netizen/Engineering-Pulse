import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { order } = await request.json(); // array of resource ids, in new order
  if (!Array.isArray(order)) {
    return NextResponse.json({ error: "order must be an array of resource ids." }, { status: 400 });
  }

  const pool = getPool();
  // Each update is independent and cheap; a study list is small (tens of
  // items at most), so a simple loop is plenty fast without needing a
  // bulk-update query.
  for (let i = 0; i < order.length; i++) {
    await pool.query(
      "UPDATE saved_resources SET position = $1 WHERE resource_id = $2 AND user_id = $3",
      [i + 1, order[i], userId]
    );
  }

  return NextResponse.json({ success: true });
}
