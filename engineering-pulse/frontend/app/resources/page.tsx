"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DomainFilter from "@/components/DomainFilter";

interface Resource {
  id: number;
  title: string;
  url: string;
  description: string;
  resource_type: string;
  source: string;
  domains: string[];
  vote_count: string;
  user_voted: boolean;
  user_saved: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  course: "Course",
  video: "Video",
  reference: "Reference",
  tool: "Tool",
  database: "Database",
};

function ResourcesContent() {
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [domain, setDomain] = useState(searchParams.get("domain") ?? "all");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    const params = new URLSearchParams();
    if (domain !== "all") params.set("domain", domain);
    setLoading(true);
    fetch(`/api/resources?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setResources(data.resources ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  async function handleVote(id: number) {
    if (status !== "authenticated") return;
    await fetch(`/api/resources/${id}/vote`, { method: "POST" });
    load();
  }

  async function handleSave(id: number) {
    if (status !== "authenticated") return;
    await fetch(`/api/resources/${id}/save`, { method: "POST" });
    load();
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-paper-dim/20 px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
          >
            ← Back to Engineering Pulse
          </Link>

          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Resources</h1>
          <p className="text-paper-dim mb-2">
            Curated courses, references, and cheat sheets — free and verified, organized by
            domain.
          </p>
          <p className="font-mono text-xs text-paper-dim/70 mb-4">
            ▲ Upvotes move a resource higher on this page · ☆ Saves add it to your Study List
          </p>

          {status === "authenticated" && (
            <Link
              href="/resources/submit"
              className="inline-block mb-8 font-mono text-xs uppercase tracking-wide text-copper-bright hover:underline"
            >
              + Submit a Resource
            </Link>
          )}

          <div className="mb-8">
            <DomainFilter active={domain} onChange={setDomain} />
          </div>

          {loading ? (
            <p className="font-mono text-sm text-paper-dim py-12 text-center">Loading...</p>
          ) : resources.length === 0 ? (
            <p className="font-mono text-sm text-paper-dim py-12 text-center">
              No resources found for this domain yet.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {resources.map((r) => (
                <div
                  key={r.id}
                  className="border border-paper-dim/20 rounded-sm p-5 hover:border-copper/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3 font-mono text-[11px] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="text-pcb">{TYPE_LABELS[r.resource_type] ?? r.resource_type}</span>
                      {r.source === "community" && (
                        <span className="px-1.5 py-0.5 border border-copper/40 text-copper-bright rounded-sm text-[10px]">
                          Community
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {r.domains.map((slug) => (
                        <span key={slug} className="text-paper-dim">
                          {slug.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display font-medium text-lg leading-snug mb-2 block hover:text-copper-bright transition-colors"
                  >
                    {r.title}
                  </a>
                  <p className="text-sm text-paper-dim leading-relaxed mb-4">{r.description}</p>

                  <div className="flex items-center gap-4 font-mono text-xs pt-3 border-t border-paper-dim/10">
                    <button
                      onClick={() => handleVote(r.id)}
                      disabled={status !== "authenticated"}
                      className={`flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        r.user_voted ? "text-copper-bright" : "text-paper-dim hover:text-copper-bright"
                      }`}
                      title={
                        status !== "authenticated"
                          ? "Sign in to vote"
                          : "Upvotes move a resource higher on this page"
                      }
                    >
                      ▲ {r.vote_count}
                    </button>
                    <button
                      onClick={() => handleSave(r.id)}
                      disabled={status !== "authenticated"}
                      className={`transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        r.user_saved ? "text-copper-bright" : "text-paper-dim hover:text-copper-bright"
                      }`}
                      title={status !== "authenticated" ? "Sign in to save" : undefined}
                    >
                      {r.user_saved ? "★ Saved to Study List" : "☆ Save to Study List"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {status !== "authenticated" && (
            <p className="font-mono text-xs text-paper-dim mt-8">
              <Link href="/login" className="text-copper-bright hover:underline">
                Sign in
              </Link>{" "}
              to upvote and save resources.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default function Resources() {
  return (
    <Suspense fallback={null}>
      <ResourcesContent />
    </Suspense>
  );
}
