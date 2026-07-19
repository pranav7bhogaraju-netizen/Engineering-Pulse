import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const threadResult = await getPool().query(
    `
    SELECT t.id, t.title, t.body, t.created_at, t.linked_item_id, t.author_id,
           u.name AS author_name, u.profile_image AS author_image,
           items.title AS linked_item_title, items.url AS linked_item_url
    FROM forum_threads t
    JOIN users u ON t.author_id = u.id
    LEFT JOIN items ON t.linked_item_id = items.id
    WHERE t.id = $1
    `,
    [params.id]
  );
  if (threadResult.rows.length === 0) {
    return NextResponse.json({ error: "Thread not found." }, { status: 404 });
  }

  const postsResult = await getPool().query(
    `
    SELECT p.id, p.content, p.created_at, p.author_id, u.name AS author_name, u.profile_image AS author_image
    FROM forum_posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.thread_id = $1
    ORDER BY p.created_at ASC
    `,
    [params.id]
  );

  return NextResponse.json({ thread: threadResult.rows[0], posts: postsResult.rows });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const pool = getPool();
  const result = await pool.query("SELECT author_id FROM forum_threads WHERE id = $1", [params.id]);
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Thread not found." }, { status: 404 });
  }

  const canDelete = isAdmin || result.rows[0].author_id === userId;
  if (!canDelete) {
    return NextResponse.json({ error: "You don't have permission to delete this." }, { status: 403 });
  }

  // forum_posts has ON DELETE CASCADE on thread_id, so replies are removed
  // automatically along with the thread.
  await pool.query("DELETE FROM forum_threads WHERE id = $1", [params.id]);
  return NextResponse.json({ success: true });
}
