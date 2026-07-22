"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface PendingProject {
  id: number;
  title: string;
  summary: string;
  source_url: string;
  difficulty: string;
  level: string;
  created_at: string;
  submitted_by_name: string | null;
  domains: string[];
}

const DOMAIN_OPTIONS = [
  { slug: "ee", label: "EE" },
  { slug: "me", label: "ME" },
  { slug: "ce", label: "CE" },
  { slug: "aero", label: "Aero" },
  { slug: "chem", label: "Chem" },
  { slug: "materials", label: "Materials" },
  { slug: "biomed", label: "Biomed" },
  { slug: "cs", label: "CS" },
];

export default function AdminProjectsPage() {
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  const [pending, setPending] = useState<PendingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<
    Record<number, { domains: string[]; difficulty: string; level: string }>
  >({});

  function load() {
    fetch("/api/admin/pending-projects")
      .then((res) => res.json())
      .then((data) => {
        setPending(data.pending ?? []);
        const initial: typeof selections = {};
        for (const p of data.pending ?? []) {
          initial[p.id] = { domains: p.domains ?? [], difficulty: p.difficulty, level: p.level };
        }
        setSelections(initial);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (isAdmin) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  function toggleDomain(id: number, slug: string) {
    setSelections((prev) => {
      const current = prev[id]?.domains ?? [];
      const updated = current.includes(slug)
        ? current.filter((d) => d !== slug)
        : [...current, slug];
      return { ...prev, [id]: { ...prev[id], domains: updated } };
    });
  }

  async function approve(id: number) {
    const sel = selections[id];
    if (!sel || sel.domains.length === 0) {
      alert("Select at least one domain before approving.");
      return;
    }
    await fetch(`/api/admin/pending-projects/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domains: sel.domains, difficulty: sel.difficulty, level: sel.level }),
    });
    load();
  }

  async function reject(id: number) {
    if (!confirm("Discard this submission?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    load();
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-paper-dim">Loading...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="font-mono text-sm text-paper-dim">Admin access required.</p>
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

        <h1 className="font-display font-bold text-2xl mb-2">Pending Project Review</h1>
        <p className="text-sm text-paper-dim mb-8">
          Community-submitted projects awaiting review — check the source link, adjust the domains,
          difficulty, and level, then approve or discard.
        </p>

        {pending.length === 0 ? (
          <p className="font-mono text-sm text-paper-dim">Nothing pending right now.</p>
        ) : (
          <div className="space-y-6">
            {pending.map((p) => (
              <div key={p.id} className="border border-copper/30 rounded-sm p-5">
                <a
                  href={p.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display font-medium text-lg hover:text-copper-bright transition-colors block mb-1"
                >
                  {p.title}
                </a>
                <p className="font-mono text-[11px] text-paper-dim mb-2 truncate">{p.source_url}</p>
                <p className="text-sm text-paper-dim mb-2">{p.summary}</p>
                <p className="font-mono text-[11px] text-paper-dim mb-3">
                  Submitted by {p.submitted_by_name ?? "unknown"}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {DOMAIN_OPTIONS.map((d) => (
                    <button
                      key={d.slug}
                      onClick={() => toggleDomain(p.id, d.slug)}
                      className={`px-2 py-1 rounded-sm font-mono text-[11px] border transition-colors ${
                        selections[p.id]?.domains.includes(d.slug)
                          ? "bg-copper text-ink border-copper"
                          : "border-paper-dim/30 text-paper-dim hover:border-copper/50"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mb-4">
                  <select
                    value={selections[p.id]?.difficulty ?? "intermediate"}
                    onChange={(e) =>
                      setSelections((prev) => ({
                        ...prev,
                        [p.id]: { ...prev[p.id], difficulty: e.target.value },
                      }))
                    }
                    className="px-2 py-1.5 bg-ink-raised border border-paper-dim/30 rounded-sm font-mono text-xs"
                  >
                    <option value="beginner">beginner</option>
                    <option value="intermediate">intermediate</option>
                    <option value="advanced">advanced</option>
                  </select>
                  <select
                    value={selections[p.id]?.level ?? "collegiate"}
                    onChange={(e) =>
                      setSelections((prev) => ({
                        ...prev,
                        [p.id]: { ...prev[p.id], level: e.target.value },
                      }))
                    }
                    className="px-2 py-1.5 bg-ink-raised border border-paper-dim/30 rounded-sm font-mono text-xs"
                  >
                    <option value="fair">fair-level</option>
                    <option value="collegiate">collegiate</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => approve(p.id)}
                    className="px-4 py-1.5 bg-pcb text-ink rounded-sm font-mono text-xs hover:opacity-90 transition-opacity"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => reject(p.id)}
                    className="px-4 py-1.5 border border-paper-dim/30 rounded-sm font-mono text-xs text-paper-dim hover:border-copper hover:text-copper transition-colors"
                  >
                    ✕ Discard
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
