"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DomainFilter from "@/components/DomainFilter";

interface Project {
  id: number;
  title: string;
  summary: string;
  difficulty: string;
  source_name: string | null;
  domains: string[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-pcb",
  intermediate: "text-copper",
  advanced: "text-copper-bright",
};

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [domain, setDomain] = useState(searchParams.get("domain") ?? "all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (domain !== "all") params.set("domain", domain);
    setLoading(true);
    fetch(`/api/projects?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setProjects(data.projects ?? []))
      .finally(() => setLoading(false));
  }, [domain]);

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
          <p className="text-paper-dim mb-8">
            Complete, hands-on project ideas — full materials list and step-by-step
            instructions included, nothing left to hunt down elsewhere.
          </p>

          <div className="mb-8">
            <DomainFilter active={domain} onChange={setDomain} />
          </div>

          {loading ? (
            <p className="font-mono text-sm text-paper-dim py-12 text-center">Loading...</p>
          ) : projects.length === 0 ? (
            <p className="font-mono text-sm text-paper-dim py-12 text-center">
              No projects for this domain yet — more coming soon.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block border border-paper-dim/20 rounded-sm p-5 hover:border-copper/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3 font-mono text-[11px] uppercase tracking-wider">
                    <span className={DIFFICULTY_COLORS[p.difficulty] ?? "text-paper-dim"}>
                      {p.difficulty}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {p.domains.map((slug) => (
                        <span key={slug} className="text-paper-dim">
                          {slug.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h2 className="font-display font-medium text-lg mb-2">{p.title}</h2>
                  <p className="text-sm text-paper-dim leading-relaxed">{p.summary}</p>
                </Link>
              ))}
            </div>
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
