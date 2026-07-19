import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const pool = getPool();
  const result = await pool.query(
    "SELECT author_id FROM forum_posts WHERE id = $1 AND thread_id = $2",
    [params.postId, params.id]
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  }

  const canDelete = isAdmin || result.rows[0].author_id === userId;
  if (!canDelete) {
    return NextResponse.json({ error: "You don't have permission to delete this." }, { status: 403 });
  }

  await pool.query("DELETE FROM forum_posts WHERE id = $1", [params.postId]);
  return NextResponse.json({ success: true });
}
