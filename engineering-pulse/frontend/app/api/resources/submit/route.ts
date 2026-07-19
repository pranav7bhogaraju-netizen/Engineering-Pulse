import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { classifyResourceSubmission } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to submit a resource." }, { status: 401 });
  }

  const { title, url, description } = await request.json();
  if (!title?.trim() || !url?.trim()) {
    return NextResponse.json({ error: "Title and URL are required." }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.trim());
    if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  const pool = getPool();

  const existing = await pool.query("SELECT id FROM resources WHERE url = $1", [parsedUrl.toString()]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "This resource has already been submitted." }, { status: 409 });
  }

  let classification;
  try {
    classification = await classifyResourceSubmission(
      title.trim(),
      parsedUrl.toString(),
      description?.trim() ?? ""
    );
  } catch (error) {
    console.error("Resource classification failed:", error);
    const isRateLimited = error instanceof Error && error.message.includes("429");
    return NextResponse.json(
      {
        error: isRateLimited
          ? "The AI reviewer is getting a lot of requests right now — please wait about a minute and try again."
          : "Couldn't review this submission right now — try again in a moment.",
      },
      { status: isRateLimited ? 429 : 500 }
    );
  }

  if (!classification.relevant) {
    return NextResponse.json(
      {
        error:
          classification.reason ??
          "This doesn't appear to fit any engineering domain on the site.",
      },
      { status: 422 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const resourceResult = await client.query(
      `INSERT INTO resources (title, url, description, resource_type, source, submitted_by)
       VALUES ($1, $2, $3, $4, 'community', $5) RETURNING id`,
      [title.trim(), parsedUrl.toString(), classification.description, classification.resource_type, userId]
    );
    const resourceId = resourceResult.rows[0].id;

    for (const domain of classification.domains) {
      await client.query(
        "INSERT INTO resource_domains (resource_id, domain_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [resourceId, domain]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Resource submission insert failed:", error);
    return NextResponse.json({ error: "Something went wrong saving your submission." }, { status: 500 });
  } finally {
    client.release();
  }

  return NextResponse.json({ success: true, domains: classification.domains });
}
