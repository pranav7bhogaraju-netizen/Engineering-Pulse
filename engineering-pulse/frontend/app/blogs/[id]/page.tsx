"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";

interface Thread {
  id: number;
  title: string;
  body: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_image: string | null;
  linked_item_title: string | null;
  linked_item_url: string | null;
}
interface Post {
  id: number;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_image: string | null;
}

function timeAgo(iso: string) {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch(`/api/threads/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setThread(data.thread ?? null);
        setPosts(data.posts ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch(`/api/threads/${id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    setReply("");
    setSubmitting(false);
    load();
  }

  async function handleDeleteThread() {
    if (!confirm("Delete this thread and all its replies? This can't be undone.")) return;
    const res = await fetch(`/api/threads/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/blogs");
  }

  async function handleDeletePost(postId: number) {
    if (!confirm("Delete this reply?")) return;
    const res = await fetch(`/api/threads/${id}/posts/${postId}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-paper-dim">Loading...</p>
      </main>
    );
  }

  if (!thread) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="font-mono text-sm text-paper-dim">Thread not found.</p>
      </main>
    );
  }

  const canDeleteThread = isAdmin || (userId && thread.author_id === userId);

  return (
    <main className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/blogs"
          className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
        >
          ← Back to discussions
        </Link>

        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="font-display font-bold text-2xl md:text-3xl">{thread.title}</h1>
          {canDeleteThread && (
            <button
              onClick={handleDeleteThread}
              className="shrink-0 font-mono text-xs text-paper-dim hover:text-copper transition-colors"
              title="Delete this thread"
            >
              🗑 Delete
            </button>
          )}
        </div>
        {thread.linked_item_title && thread.linked_item_url && (
          <a
            href={thread.linked_item_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-mono text-[11px] text-pcb uppercase tracking-wide mb-3 hover:underline"
          >
            Discussing: {thread.linked_item_title}
          </a>
        )}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/profile/${thread.author_id}`}
            className="flex items-center gap-1.5 font-mono text-xs text-paper-dim hover:text-copper-bright transition-colors"
          >
            <Avatar name={thread.author_name} image={thread.author_image} size={18} />
            {thread.author_name}
          </Link>
          <span className="font-mono text-xs text-paper-dim">· {timeAgo(thread.created_at)}</span>
        </div>
        <p className="text-paper-dim leading-relaxed whitespace-pre-wrap mb-10 pb-10 border-b border-paper-dim/20">
          {thread.body}
        </p>

        <div className="space-y-6 mb-10">
          {posts.map((post) => {
            const canDeletePost = isAdmin || (userId && post.author_id === userId);
            return (
              <div key={post.id} className="border-l-2 border-paper-dim/20 pl-4">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/profile/${post.author_id}`}
                      className="flex items-center gap-1.5 font-mono text-xs text-paper-dim hover:text-copper-bright transition-colors"
                    >
                      <Avatar name={post.author_name} image={post.author_image} size={16} />
                      {post.author_name}
                    </Link>
                    <span className="font-mono text-xs text-paper-dim">
                      · {timeAgo(post.created_at)}
                    </span>
                  </div>
                  {canDeletePost && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="font-mono text-xs text-paper-dim hover:text-copper transition-colors"
                      title="Delete this reply"
                    >
                      🗑
                    </button>
                  )}
                </div>
                <p className="text-paper-dim leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            );
          })}
        </div>

        {status === "authenticated" ? (
          <form onSubmit={handleReply} className="space-y-3">
            <textarea
              required
              rows={4}
              placeholder="Write a reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50 resize-y"
            />
            {error && <p className="text-copper text-xs font-mono">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-copper text-ink rounded-sm font-mono text-sm hover:bg-copper-bright transition-colors disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Reply"}
            </button>
          </form>
        ) : (
          <p className="font-mono text-sm text-paper-dim">
            <Link href="/login" className="text-copper-bright hover:underline">
              Sign in
            </Link>{" "}
            to reply.
          </p>
        )}
      </div>
    </main>
  );
}
