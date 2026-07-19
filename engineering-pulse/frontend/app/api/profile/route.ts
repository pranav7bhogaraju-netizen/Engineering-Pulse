import { NextRequest, NextResponse } from "next/server";
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
    "SELECT name, email, profile_image, display_phrase, about FROM users WHERE id = $1",
    [userId]
  );

  return NextResponse.json({ profile: result.rows[0] ?? null });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { display_phrase, about } = await request.json();

  await getPool().query(
    "UPDATE users SET display_phrase = COALESCE($1, display_phrase), about = COALESCE($2, about) WHERE id = $3",
    [display_phrase, about, userId]
  );

  return NextResponse.json({ success: true });
}
