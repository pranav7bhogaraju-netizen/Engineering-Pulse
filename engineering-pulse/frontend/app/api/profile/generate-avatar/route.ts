import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateSvgArt } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { prompt } = await request.json();
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Describe what you'd like generated." }, { status: 400 });
  }

  try {
    const svg = await generateSvgArt(prompt.trim());
    // Returned as a data URL, same shape as a regular upload, so the
    // frontend can treat "AI generated" and "uploaded" images identically
    // once the user confirms they want to use it.
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    return NextResponse.json({ dataUrl });
  } catch (error) {
    console.error("SVG generation failed:", error);
    return NextResponse.json(
      { error: "Couldn't generate that — try describing it differently." },
      { status: 500 }
    );
  }
}
