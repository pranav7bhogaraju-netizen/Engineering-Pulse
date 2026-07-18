import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { note } = await request.json();

  await getPool().query(
    "UPDATE saved_resources SET note = $1 WHERE resource_id = $2 AND user_id = $3",
    [note ?? null, params.id, userId]
  );

  return NextResponse.json({ success: true });
}
