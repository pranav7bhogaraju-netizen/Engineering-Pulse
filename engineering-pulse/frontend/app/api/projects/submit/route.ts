import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_DOMAINS = ["ee", "me", "ce", "aero", "chem", "materials", "biomed", "cs"];
const VALID_DIFFICULTY = ["beginner", "intermediate", "advanced"];
const VALID_LEVEL = ["fair", "collegiate"];
const POINTER = "See the linked source for the full build guide.";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to submit a project." }, { status: 401 });
  }

  const { title, source_url, summary, difficulty, level, domains } = await request.json();

  if (!title?.trim() || !source_url?.trim()) {
    return NextResponse.json({ error: "Title and source link are required." }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(source_url.trim());
    if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid link." }, { status: 400 });
  }

  const cleanDomains = Array.isArray(domains)
    ? domains.filter((d: string) => VALID_DOMAINS.includes(d))
    : [];
  if (cleanDomains.length === 0) {
    return NextResponse.json({ error: "Pick at least one domain." }, { status: 400 });
  }

  const diff = VALID_DIFFICULTY.includes(difficulty) ? difficulty : "intermediate";
  const lvl = VALID_LEVEL.includes(level) ? level : "collegiate";
  const sourceName = parsedUrl.hostname.replace(/^www\./, "");

  const pool = getPool();

  const existing = await pool.query("SELECT id FROM projects WHERE source_url = $1", [parsedUrl.toString()]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "A project with this link has already been submitted." }, { status: 409 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO projects
         (title, summary, difficulty, level, materials, instructions, source_url, source_name, status, source, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $5, $6, $7, 'pending', 'community', $8)
       RETURNING id`,
      [
        title.trim(),
        summary?.trim() || `${title.trim()} — community-submitted project.`,
        diff,
        lvl,
        POINTER,
        parsedUrl.toString(),
        sourceName,
        userId,
      ]
    );
    const projectId = result.rows[0].id;

    for (const domain of cleanDomains) {
      await client.query(
        "INSERT INTO project_domains (project_id, domain_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [projectId, domain]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Project submission insert failed:", error);
    return NextResponse.json({ error: "Something went wrong saving your submission." }, { status: 500 });
  } finally {
    client.release();
  }

  return NextResponse.json({ success: true });
}
