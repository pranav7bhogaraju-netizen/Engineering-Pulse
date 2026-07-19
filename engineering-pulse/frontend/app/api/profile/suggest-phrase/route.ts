import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { suggestDisplayPhrase } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const pool = getPool();

  const [threadCount, postCount, topDomains] = await Promise.all([
    pool.query("SELECT COUNT(*) AS n FROM forum_threads WHERE author_id = $1", [userId]),
    pool.query("SELECT COUNT(*) AS n FROM forum_posts WHERE author_id = $1", [userId]),
    pool.query(
      `SELECT rd.domain_slug, COUNT(*) AS n
       FROM saved_resources sr
       JOIN resource_domains rd ON sr.resource_id = rd.resource_id
       WHERE sr.user_id = $1
       GROUP BY rd.domain_slug
       ORDER BY n DESC
       LIMIT 3`,
      [userId]
    ),
  ]);

  const context = `
Threads started: ${threadCount.rows[0].n}
Replies posted: ${postCount.rows[0].n}
Top engineering domains from saved resources: ${
    topDomains.rows.map((r) => r.domain_slug).join(", ") || "none yet"
  }
`.trim();

  try {
    const phrase = await suggestDisplayPhrase(context);
    return NextResponse.json({ phrase });
  } catch (error) {
    console.error("Phrase suggestion failed:", error);
    return NextResponse.json(
      { error: "Couldn't generate a suggestion right now." },
      { status: 500 }
    );
  }
}
