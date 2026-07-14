import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const threadResult = await getPool().query(
    `
    SELECT t.id, t.title, t.body, t.created_at, t.linked_item_id,
           u.name AS author_name,
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
    SELECT p.id, p.content, p.created_at, u.name AS author_name
    FROM forum_posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.thread_id = $1
    ORDER BY p.created_at ASC
    `,
    [params.id]
  );

  return NextResponse.json({ thread: threadResult.rows[0], posts: postsResult.rows });
}
