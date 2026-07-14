"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewThread() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push(`/blogs/${data.id}`);
  }

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="font-mono text-sm text-paper-dim">
          <Link href="/login" className="text-copper-bright hover:underline">
            Sign in
          </Link>{" "}
          to start a new thread.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/blogs"
          className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
        >
          ← Back to discussions
        </Link>

        <h1 className="font-display font-bold text-2xl mb-8">Start a new thread</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Thread title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
          />
          <textarea
            required
            rows={8}
            placeholder="What do you want to discuss?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50 resize-y"
          />
          {error && <p className="text-copper text-xs font-mono">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-copper text-ink rounded-sm font-mono text-sm hover:bg-copper-bright transition-colors disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post thread"}
          </button>
        </form>
      </div>
    </main>
  );
}
