import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const result = await getPool().query(
    `SELECT r.id, r.title, r.url, r.description, r.created_at, u.name AS submitted_by_name
     FROM resources r
     LEFT JOIN users u ON r.submitted_by = u.id
     WHERE r.status = 'pending'
     ORDER BY r.created_at ASC`
  );

  return NextResponse.json({ pending: result.rows });
}
