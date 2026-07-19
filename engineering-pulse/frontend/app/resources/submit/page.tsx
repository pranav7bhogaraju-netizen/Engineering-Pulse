"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SubmitResource() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewedDomains, setReviewedDomains] = useState<string[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/resources/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, description }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    setReviewedDomains(data.domains);
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
          to submit a resource.
        </p>
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
            Your submission passed AI review and is now live, tagged under{" "}
            {reviewedDomains.map((d) => d.toUpperCase()).join(", ")}.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/resources")}
              className="px-4 py-2 bg-copper text-ink rounded-sm font-mono text-sm hover:bg-copper-bright transition-colors"
            >
              View Resources
            </button>
            <button
              onClick={() => {
                setReviewedDomains(null);
                setTitle("");
                setUrl("");
                setDescription("");
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
          href="/resources"
          className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
        >
          ← Back to Resources
        </Link>

        <h1 className="font-display font-bold text-2xl mb-2">Submit a Resource</h1>
        <p className="text-sm text-paper-dim mb-8">
          Share a course, reference, tool, or cheat sheet you've found useful. An AI reviewer
          checks it fits an engineering domain and tags it automatically — no waiting on manual
          approval, but genuinely off-topic or spam submissions will be declined.
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
              placeholder="e.g. Free FEA fundamentals course"
              className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-1.5">
              URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-1.5">
              Description <span className="normal-case text-paper-dim/60">(optional — AI will write one if left blank)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this useful?"
              className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50 resize-y"
            />
          </div>

          {error && <p className="text-copper text-xs font-mono">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-copper text-ink rounded-sm font-mono text-sm hover:bg-copper-bright transition-colors disabled:opacity-50"
          >
            {submitting ? "AI is reviewing..." : "Submit for Review"}
          </button>
        </form>
      </div>
    </main>
  );
}
