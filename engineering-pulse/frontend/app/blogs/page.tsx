"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  reply_count: string;
}

function timeAgo(iso: string) {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function Blogs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/threads")
      .then((res) => res.json())
      .then((data) => setThreads(data.threads ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen">
      <section className="border-b border-paper-dim/20 px-6 py-14">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
          >
            ← Back to Engineering Pulse
          </Link>

          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display font-bold text-3xl md:text-4xl">Discussion</h1>

            {status === "authenticated" ? (
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-paper-dim">{session.user?.name ?? session.user?.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/blogs" })}
                  className="text-copper-bright hover:underline"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="font-mono text-xs uppercase text-copper-bright hover:underline"
              >
                Sign in
              </Link>
            )}
          </div>

          {status === "authenticated" && (
            <Link
              href="/blogs/new"
              className="inline-block mb-8 px-4 py-2 bg-copper text-ink rounded-sm font-mono text-sm hover:bg-copper-bright transition-colors"
            >
              + New Thread
            </Link>
          )}

          {loading ? (
            <p className="font-mono text-sm text-paper-dim">Loading threads...</p>
          ) : threads.length === 0 ? (
            <p className="font-mono text-sm text-paper-dim">
              No discussions yet — {status === "authenticated" ? "start the first one." : "sign in to start one."}
            </p>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => router.push(`/blogs/${thread.id}`)}
                  className="block border border-paper-dim/20 rounded-sm p-4 hover:border-copper/50 transition-colors cursor-pointer"
                >
                  <h2 className="font-display font-medium text-lg mb-1">{thread.title}</h2>
                  {thread.linked_item_title && (
                    <p className="font-mono text-[11px] text-pcb uppercase tracking-wide mb-2">
                      Discussing: {thread.linked_item_title}
                    </p>
                  )}
                  <Link
                    href={`/profile/${thread.author_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-paper-dim hover:text-copper-bright transition-colors"
                  >
                    <Avatar name={thread.author_name} image={thread.author_image} size={16} />
                    {thread.author_name}
                  </Link>
                  <span className="font-mono text-xs text-paper-dim">
                    {" "}
                    · {timeAgo(thread.created_at)} · {thread.reply_count}{" "}
                    {thread.reply_count === "1" ? "reply" : "replies"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
