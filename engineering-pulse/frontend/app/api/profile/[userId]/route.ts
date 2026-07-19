import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const result = await getPool().query(
    `SELECT name, profile_image, profile_image_prompt, display_phrase, about, created_at
     FROM users WHERE id = $1`,
    [params.userId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({ profile: result.rows[0] });
}
