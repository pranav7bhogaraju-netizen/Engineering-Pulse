import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_DATA_URL_LENGTH = 3_000_000; // ~2.2MB decoded, generous for a small profile pic/GIF

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { dataUrl } = await request.json();

  if (!dataUrl || typeof dataUrl !== "string") {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }
  if (!dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "File must be an image or GIF." }, { status: 400 });
  }
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    return NextResponse.json({ error: "Image is too large — please use something under 2MB." }, { status: 400 });
  }

  await getPool().query("UPDATE users SET profile_image = $1 WHERE id = $2", [dataUrl, userId]);

  return NextResponse.json({ success: true });
}
