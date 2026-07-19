import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getPool().query(`
    SELECT
      t.id, t.title, t.body, t.created_at, t.linked_item_id,
      u.name AS author_name, u.profile_image AS author_image,
      items.title AS linked_item_title,
      COUNT(p.id) AS reply_count
    FROM forum_threads t
    JOIN users u ON t.author_id = u.id
    LEFT JOIN items ON t.linked_item_id = items.id
    LEFT JOIN forum_posts p ON p.thread_id = t.id
    GROUP BY t.id, u.name, u.profile_image, items.title
    ORDER BY t.created_at DESC
    LIMIT 50
  `);
  return NextResponse.json({ threads: result.rows });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to start a thread." }, { status: 401 });
  }

  const { title, body, linkedItemId } = await request.json();
  if (!title || !body) {
    return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
  }

  const result = await getPool().query(
    `INSERT INTO forum_threads (title, body, author_id, linked_item_id)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [title, body, userId, linkedItemId || null]
  );

  return NextResponse.json({ id: result.rows[0].id });
}
