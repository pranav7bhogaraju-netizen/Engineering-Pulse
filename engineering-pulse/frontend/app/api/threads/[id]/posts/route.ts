import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to reply." }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Reply can't be empty." }, { status: 400 });
  }

  await getPool().query(
    `INSERT INTO forum_posts (thread_id, author_id, content) VALUES ($1, $2, $3)`,
    [params.id, userId, content]
  );

  return NextResponse.json({ success: true });
}
