"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ProjectDetail {
  id: number;
  title: string;
  summary: string;
  difficulty: string;
  materials: string;
  instructions: string;
  source_url: string | null;
  source_name: string | null;
  domains: string[];
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => setProject(data.project ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-paper-dim">Loading...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="font-mono text-sm text-paper-dim">Project not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/projects"
          className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
        >
          ← Back to Projects
        </Link>

        <div className="flex items-center gap-2 mb-3 font-mono text-[11px] uppercase tracking-wider">
          <span className="text-copper">{project.difficulty}</span>
          <span className="text-paper-dim">·</span>
          {project.domains.map((slug) => (
            <span key={slug} className="text-paper-dim">
              {slug.toUpperCase()}
            </span>
          ))}
        </div>

        <h1 className="font-display font-bold text-2xl md:text-3xl mb-3">{project.title}</h1>
        <p className="text-paper-dim leading-relaxed mb-10">{project.summary}</p>

        <div className="border border-paper-dim/20 rounded-sm p-6 mb-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-copper-bright mb-3">
            Materials
          </p>
          <div className="text-sm text-paper-dim leading-relaxed whitespace-pre-wrap">
            {project.materials}
          </div>
        </div>

        <div className="border border-paper-dim/20 rounded-sm p-6 mb-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-copper-bright mb-3">
            Instructions
          </p>
          <div className="text-sm text-paper-dim leading-relaxed whitespace-pre-wrap">
            {project.instructions}
          </div>
        </div>

        {project.source_url && (
          <p className="font-mono text-xs text-paper-dim">
            Based on a project from{" "}
            <a
              href={project.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-copper-bright hover:underline"
            >
              {project.source_name ?? "the original source"}
            </a>
            .
          </p>
        )}
      </div>
    </main>
  );
}
