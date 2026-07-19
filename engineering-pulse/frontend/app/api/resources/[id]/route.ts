import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const pool = getPool();
  const result = await pool.query("SELECT submitted_by FROM resources WHERE id = $1", [params.id]);
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }

  const submittedBy = result.rows[0].submitted_by;
  // Curated (site-added) resources have submitted_by = NULL, so only an
  // admin can ever delete those — a regular user can only delete resources
  // they personally submitted.
  const canDelete = isAdmin || (submittedBy !== null && submittedBy === userId);
  if (!canDelete) {
    return NextResponse.json({ error: "You don't have permission to delete this." }, { status: 403 });
  }

  await pool.query("DELETE FROM resources WHERE id = $1", [params.id]);
  return NextResponse.json({ success: true });
}
