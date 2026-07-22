import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { classifyProjectSubmission } from "@/lib/gemini";

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

  // User's own picks — used as the fallback if the AI reviewer is unavailable.
  const userDomains = Array.isArray(domains) ? domains.filter((d: string) => VALID_DOMAINS.includes(d)) : [];
  const userDiff = VALID_DIFFICULTY.includes(difficulty) ? difficulty : "intermediate";
  const userLevel = VALID_LEVEL.includes(level) ? level : "collegiate";
  const userSummary = summary?.trim() || `${title.trim()} — community-submitted project.`;
  const sourceName = parsedUrl.hostname.replace(/^www\./, "");

  const pool = getPool();

  const existing = await pool.query("SELECT id FROM projects WHERE source_url = $1", [parsedUrl.toString()]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "A project with this link has already been submitted." }, { status: 409 });
  }

  // --- AI review ---
  let classification;
  try {
    classification = await classifyProjectSubmission(title.trim(), parsedUrl.toString(), summary?.trim() ?? "");
  } catch (error) {
    console.error("Project classification failed:", error);
    const isRateLimited = error instanceof Error && error.message.includes("429");

    if (isRateLimited) {
      // AI reviewer temporarily unavailable — queue for manual review using
      // the submitter's own picks, so the submission isn't lost.
      if (userDomains.length === 0) {
        return NextResponse.json({ error: "Pick at least one domain." }, { status: 400 });
      }
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await client.query(
          `INSERT INTO projects
             (title, summary, difficulty, level, materials, instructions, source_url, source_name, status, source, submitted_by)
           VALUES ($1, $2, $3, $4, $5, $5, $6, $7, 'pending', 'community', $8) RETURNING id`,
          [title.trim(), userSummary, userDiff, userLevel, POINTER, parsedUrl.toString(), sourceName, userId]
        );
        const projectId = result.rows[0].id;
        for (const domain of userDomains) {
          await client.query(
            "INSERT INTO project_domains (project_id, domain_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [projectId, domain]
          );
        }
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        console.error("Queued project insert failed:", e);
        return NextResponse.json({ error: "Something went wrong saving your submission." }, { status: 500 });
      } finally {
        client.release();
      }
      return NextResponse.json({
        queued: true,
        message:
          "The AI reviewer is busy right now, so this has been queued for manual review instead — it'll be looked at soon.",
      });
    }

    return NextResponse.json(
      { error: "Couldn't review this submission right now — try again in a moment." },
      { status: 500 }
    );
  }

  if (!classification.relevant) {
    return NextResponse.json(
      { error: classification.reason ?? "This doesn't appear to be a relevant engineering project." },
      { status: 422 }
    );
  }

  // --- Relevant: auto-publish with the AI's classification ---
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO projects
         (title, summary, difficulty, level, materials, instructions, source_url, source_name, status, source, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $5, $6, $7, 'published', 'community', $8) RETURNING id`,
      [
        title.trim(),
        classification.summary,
        classification.difficulty,
        classification.level,
        POINTER,
        parsedUrl.toString(),
        sourceName,
        userId,
      ]
    );
    const projectId = result.rows[0].id;
    for (const domain of classification.domains) {
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

  return NextResponse.json({ success: true, domains: classification.domains });
}
