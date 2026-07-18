import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const result = await getPool().query(
    `
    SELECT
      r.id, r.title, r.url, r.description, r.resource_type,
      sr.position, sr.note
    FROM saved_resources sr
    JOIN resources r ON sr.resource_id = r.id
    WHERE sr.user_id = $1
    ORDER BY sr.position ASC NULLS LAST
    `,
    [userId]
  );

  return NextResponse.json({ items: result.rows });
}
