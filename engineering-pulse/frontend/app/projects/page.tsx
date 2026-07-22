"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DomainFilter from "@/components/DomainFilter";

interface Project {
  id: number;
  title: string;
  summary: string;
  difficulty: string;
  level: string | null;
  source_url: string | null;
  source_name: string | null;
  domains: string[];
  vote_count: string;
  user_voted: boolean;
  user_saved: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-pcb",
  intermediate: "text-copper",
  advanced: "text-copper-bright",
};

const DIFFICULTY_RANK: Record<string, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const LEVEL_LABELS: Record<string, string> = {
  fair: "Fair-Level",
  collegiate: "Collegiate",
};

type Tab = "all" | "saved";
type LevelFilter = "all" | "fair" | "collegiate";

function ProjectsContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  const [tab, setTab] = useState<Tab>("all");
  const [domain, setDomain] = useState(searchParams.get("domain") ?? "all");
  const [sortDir, setSortDir] = useState<"easiest" | "hardest">("easiest");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const endpoint =
      tab === "saved"
        ? "/api/projects/saved"
        : (() => {
            const params = new URLSearchParams();
            if (domain !== "all") params.set("domain", domain);
            return `/api/projects?${params.toString()}`;
          })();

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setProjects(data.projects ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, tab]);

  async function handleVote(id: number) {
    if (status !== "authenticated") return;
    await fetch(`/api/projects/${id}/vote`, { method: "POST" });
    load();
  }

  async function handleSave(id: number) {
    if (status !== "authenticated") return;
    await fetch(`/api/projects/${id}/save`, { method: "POST" });
    load();
  }

  const visibleProjects = projects.filter(
    (p) => levelFilter === "all" || p.level === levelFilter
  );

  const sortedProjects = [...visibleProjects].sort((a, b) => {
    const diff =
      (DIFFICULTY_RANK[a.difficulty] ?? 1) - (DIFFICULTY_RANK[b.difficulty] ?? 1);
    const byDifficulty = sortDir === "easiest" ? diff : -diff;
    if (byDifficulty !== 0) return byDifficulty;
    // Tiebreaker: more upvoted first.
    return Number(b.vote_count) - Number(a.vote_count);
  });

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

          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Projects</h1>
          <p className="text-paper-dim mb-2">
            Hand-picked, verified engineering builds — click through to the full guide at the
            source, organized by domain and difficulty.
          </p>
          <p className="font-mono text-xs text-paper-dim/70 mb-4">
            ▲ Upvotes surface the best builds · ☆ Saves add a project to your Saved tab
          </p>

          <div className="flex items-center gap-4 mb-6 font-mono text-xs">
            <Link href="/projects/submit" className="text-copper-bright hover:underline">
              + Submit a project
            </Link>
            {isAdmin && (
              <Link href="/admin/projects" className="text-paper-dim hover:text-copper-bright transition-colors">
                Review pending →
              </Link>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mb-8 font-mono text-xs uppercase tracking-widest">
            <button
              onClick={() => setTab("all")}
              className={`pb-1 border-b-2 transition-colors ${
                tab === "all"
                  ? "border-copper-bright text-copper-bright"
                  : "border-transparent text-paper-dim hover:text-copper-bright"
              }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setTab("saved")}
              className={`pb-1 border-b-2 transition-colors ${
                tab === "saved"
                  ? "border-copper-bright text-copper-bright"
                  : "border-transparent text-paper-dim hover:text-copper-bright"
              }`}
            >
              Saved Projects
            </button>
          </div>

          {/* Filters — only for the All tab */}
          {tab === "all" && (
            <div className="mb-6">
              <DomainFilter active={domain} onChange={setDomain} />
            </div>
          )}

          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider">
              {(["all", "fair", "collegiate"] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLevelFilter(lv)}
                  className={`transition-colors ${
                    levelFilter === lv
                      ? "text-copper-bright"
                      : "text-paper-dim hover:text-copper-bright"
                  }`}
                >
                  {lv === "all" ? "All Levels" : LEVEL_LABELS[lv]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSortDir((d) => (d === "easiest" ? "hardest" : "easiest"))}
              className="font-mono text-[11px] uppercase tracking-wider text-paper-dim hover:text-copper-bright transition-colors"
            >
              Sort: {sortDir === "easiest" ? "Easiest First" : "Hardest First"} ⇅
            </button>
          </div>

          {tab === "saved" && status !== "authenticated" ? (
            <p className="font-mono text-sm text-paper-dim py-12 text-center">
              <Link href="/login" className="text-copper-bright hover:underline">
                Sign in
              </Link>{" "}
              to see your saved projects.
            </p>
          ) : loading ? (
            <p className="font-mono text-sm text-paper-dim py-12 text-center">Loading...</p>
          ) : sortedProjects.length === 0 ? (
            <p className="font-mono text-sm text-paper-dim py-12 text-center">
              {tab === "saved"
                ? "No saved projects yet — tap ☆ Save on any project to add it here."
                : "No projects for this domain yet — more coming soon."}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sortedProjects.map((p) => (
                <div
                  key={p.id}
                  className="border border-paper-dim/20 rounded-sm p-5 hover:border-copper/50 transition-colors flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3 font-mono text-[11px] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className={DIFFICULTY_COLORS[p.difficulty] ?? "text-paper-dim"}>
                        {p.difficulty}
                      </span>
                      {p.level && (
                        <span className="px-1.5 py-0.5 border border-copper/40 rounded-sm text-[10px] text-copper-bright normal-case">
                          {LEVEL_LABELS[p.level] ?? p.level}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.domains.map((slug) => (
                        <span key={slug} className="text-paper-dim">
                          {slug.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={p.source_url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h2 className="font-display font-medium text-lg mb-2 group-hover:text-copper-bright transition-colors">
                      {p.title}
                    </h2>
                    <p className="text-sm text-paper-dim leading-relaxed mb-3">{p.summary}</p>
                  </a>
                  {p.source_name && (
                    <p className="font-mono text-[11px] text-paper-dim/70 mb-4">
                      ↗ Full guide at {p.source_name}
                    </p>
                  )}

                  <div className="flex items-center gap-4 font-mono text-xs pt-3 mt-auto border-t border-paper-dim/10">
                    <button
                      onClick={() => handleVote(p.id)}
                      disabled={status !== "authenticated"}
                      className={`flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        p.user_voted ? "text-copper-bright" : "text-paper-dim hover:text-copper-bright"
                      }`}
                      title={status !== "authenticated" ? "Sign in to vote" : "Upvote this project"}
                    >
                      ▲ {p.vote_count}
                    </button>
                    <button
                      onClick={() => handleSave(p.id)}
                      disabled={status !== "authenticated"}
                      className={`transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        p.user_saved ? "text-copper-bright" : "text-paper-dim hover:text-copper-bright"
                      }`}
                      title={status !== "authenticated" ? "Sign in to save" : undefined}
                    >
                      {p.user_saved ? "★ Saved" : "☆ Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "all" && status !== "authenticated" && (
            <p className="font-mono text-xs text-paper-dim mt-8">
              <Link href="/login" className="text-copper-bright hover:underline">
                Sign in
              </Link>{" "}
              to upvote and save projects.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default function Projects() {
  return (
    <Suspense fallback={null}>
      <ProjectsContent />
    </Suspense>
  );
}
