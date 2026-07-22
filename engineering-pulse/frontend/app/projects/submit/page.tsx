"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function SubmitProject() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [level, setLevel] = useState("collegiate");
  const [domains, setDomains] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewedDomains, setReviewedDomains] = useState<string[] | null>(null);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);

  function toggleDomain(slug: string) {
    setDomains((prev) => (prev.includes(slug) ? prev.filter((d) => d !== slug) : [...prev, slug]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/projects/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, source_url: sourceUrl, summary, difficulty, level, domains }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }
    if (data.queued) {
      setQueuedMessage(data.message);
    } else {
      setReviewedDomains(data.domains ?? []);
    }
    setSubmitting(false);
  }

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="font-mono text-sm text-paper-dim">
          <Link href="/login" className="text-copper-bright hover:underline">
            Sign in
          </Link>{" "}
          to submit a project.
        </p>
      </main>
    );
  }

  if (queuedMessage) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-copper-bright mb-3">
            ⏳ Queued for review
          </p>
          <p className="text-paper-dim mb-6">{queuedMessage}</p>
          <button
            onClick={() => router.push("/projects")}
            className="px-4 py-2 bg-copper text-ink rounded-sm font-mono text-sm hover:bg-copper-bright transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </main>
    );
  }

  if (reviewedDomains) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-pcb mb-3">
            ✓ Approved and live
          </p>
          <p className="text-paper-dim mb-6">
            Your project passed AI review and is now live, tagged under{" "}
            {reviewedDomains.map((d) => d.toUpperCase()).join(", ")}.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/projects")}
              className="px-4 py-2 bg-copper text-ink rounded-sm font-mono text-sm hover:bg-copper-bright transition-colors"
            >
              View Projects
            </button>
            <button
              onClick={() => {
                setReviewedDomains(null);
                setTitle("");
                setSourceUrl("");
                setSummary("");
                setDomains([]);
              }}
              className="px-4 py-2 border border-paper-dim/30 rounded-sm font-mono text-sm hover:border-copper/50 hover:text-copper-bright transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-14">
      <div className="max-w-lg mx-auto">
        <Link
          href="/projects"
          className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
        >
          ← Back to Projects
        </Link>

        <h1 className="font-display font-bold text-2xl mb-2">Submit a Project</h1>
        <p className="text-sm text-paper-dim mb-8">
          Share a hands-on build with a link to the full guide. An AI reviewer checks it&apos;s a
          genuine, on-topic engineering project and tags it automatically — no waiting on manual
          approval, but off-topic or mislabeled submissions will be declined. Your difficulty,
          level, and domain picks are used as a fallback if the reviewer is momentarily busy.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Arduino line-following robot"
              className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-1.5">
              Source Link
            </label>
            <input
              type="url"
              required
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://... (the full build guide)"
              className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-1.5">
              Summary <span className="normal-case text-paper-dim/60">(one line)</span>
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What does the project do?"
              className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50 resize-y"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-1.5">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
              >
                <option value="fair">Fair-Level</option>
                <option value="collegiate">Collegiate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-1.5">
              Domain(s)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DOMAIN_OPTIONS.map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => toggleDomain(d.slug)}
                  className={`px-2 py-1 rounded-sm font-mono text-[11px] border transition-colors ${
                    domains.includes(d.slug)
                      ? "bg-copper text-ink border-copper"
                      : "border-paper-dim/30 text-paper-dim hover:border-copper/50"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-copper text-xs font-mono">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-copper text-ink rounded-sm font-mono text-sm hover:bg-copper-bright transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </form>
      </div>
    </main>
  );
}
