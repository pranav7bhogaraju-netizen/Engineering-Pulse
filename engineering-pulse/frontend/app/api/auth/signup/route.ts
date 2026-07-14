import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are all required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await getPool().query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await getPool().query(
    `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)`,
    [name, email, passwordHash]
  );

  return NextResponse.json({ success: true });
}
