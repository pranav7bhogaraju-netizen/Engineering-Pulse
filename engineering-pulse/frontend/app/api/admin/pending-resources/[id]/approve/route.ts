import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_DOMAINS = ["ee", "me", "ce", "aero", "chem", "materials", "biomed", "cs"];
const VALID_TYPES = ["course", "video", "reference", "tool", "database"];

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { domains, resourceType, description } = await request.json();
  const cleanDomains = Array.isArray(domains)
    ? domains.filter((d: string) => VALID_DOMAINS.includes(d))
    : [];
  if (cleanDomains.length === 0) {
    return NextResponse.json({ error: "Select at least one domain." }, { status: 400 });
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE resources
       SET status = 'published',
           resource_type = $1,
           description = COALESCE(NULLIF($2, ''), description)
       WHERE id = $3 AND status = 'pending'`,
      [VALID_TYPES.includes(resourceType) ? resourceType : "reference", description ?? "", params.id]
    );

    for (const domain of cleanDomains) {
      await client.query(
        "INSERT INTO resource_domains (resource_id, domain_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [params.id, domain]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Approve pending resource failed:", error);
    return NextResponse.json({ error: "Something went wrong approving this." }, { status: 500 });
  } finally {
    client.release();
  }

  return NextResponse.json({ success: true });
}
