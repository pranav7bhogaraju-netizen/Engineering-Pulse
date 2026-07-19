"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface PendingResource {
  id: number;
  title: string;
  url: string;
  description: string;
  created_at: string;
  submitted_by_name: string | null;
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

const TYPE_OPTIONS = ["course", "video", "reference", "tool", "database"];

export default function AdminResourcesPage() {
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  const [pending, setPending] = useState<PendingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<
    Record<number, { domains: string[]; resourceType: string; description: string }>
  >({});

  function load() {
    fetch("/api/admin/pending-resources")
      .then((res) => res.json())
      .then((data) => {
        setPending(data.pending ?? []);
        const initial: typeof selections = {};
        for (const r of data.pending ?? []) {
          initial[r.id] = { domains: [], resourceType: "reference", description: r.description };
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
    await fetch(`/api/admin/pending-resources/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domains: sel.domains,
        resourceType: sel.resourceType,
        description: sel.description,
      }),
    });
    load();
  }

  async function reject(id: number) {
    if (!confirm("Discard this submission?")) return;
    await fetch(`/api/resources/${id}`, { method: "DELETE" });
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
          href="/resources"
          className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
        >
          ← Back to Resources
        </Link>

        <h1 className="font-display font-bold text-2xl mb-2">Pending Resource Review</h1>
        <p className="text-sm text-paper-dim mb-8">
          Submissions queued here because the AI reviewer was rate-limited when they came in —
          pick domain(s) and approve, or discard.
        </p>

        {pending.length === 0 ? (
          <p className="font-mono text-sm text-paper-dim">Nothing pending right now.</p>
        ) : (
          <div className="space-y-6">
            {pending.map((r) => (
              <div key={r.id} className="border border-copper/30 rounded-sm p-5">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display font-medium text-lg hover:text-copper-bright transition-colors block mb-1"
                >
                  {r.title}
                </a>
                <p className="font-mono text-[11px] text-paper-dim mb-3 truncate">{r.url}</p>
                <p className="font-mono text-[11px] text-paper-dim mb-3">
                  Submitted by {r.submitted_by_name ?? "unknown"}
                </p>

                <textarea
                  value={selections[r.id]?.description ?? ""}
                  onChange={(e) =>
                    setSelections((prev) => ({
                      ...prev,
                      [r.id]: { ...prev[r.id], description: e.target.value },
                    }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-xs font-mono mb-3 focus:outline-none focus:border-copper/50"
                />

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {DOMAIN_OPTIONS.map((d) => (
                    <button
                      key={d.slug}
                      onClick={() => toggleDomain(r.id, d.slug)}
                      className={`px-2 py-1 rounded-sm font-mono text-[11px] border transition-colors ${
                        selections[r.id]?.domains.includes(d.slug)
                          ? "bg-copper text-ink border-copper"
                          : "border-paper-dim/30 text-paper-dim hover:border-copper/50"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <select
                  value={selections[r.id]?.resourceType ?? "reference"}
                  onChange={(e) =>
                    setSelections((prev) => ({
                      ...prev,
                      [r.id]: { ...prev[r.id], resourceType: e.target.value },
                    }))
                  }
                  className="mb-4 px-2 py-1.5 bg-ink-raised border border-paper-dim/30 rounded-sm font-mono text-xs"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => approve(r.id)}
                    className="px-4 py-1.5 bg-pcb text-ink rounded-sm font-mono text-xs hover:opacity-90 transition-opacity"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => reject(r.id)}
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
