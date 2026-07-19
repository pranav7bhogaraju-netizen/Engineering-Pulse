"use client";

import { useEffect, useState } from "react";

interface OverviewData {
  summary: string;
  generated_at: string;
}

function timeAgo(iso: string) {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "updated just now";
  if (hours === 1) return "updated 1h ago";
  return `updated ${hours}h ago`;
}

export default function AIOverviewPanel({ track }: { track: "technical" | "news" }) {
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    fetch("/api/overview")
      .then((res) => res.json())
      .then((json) => setData(json.overviews?.[track] ?? null))
      .catch(() => {});
  }, [track]);

  if (!data) return null;

  return (
    <div className="hidden 2xl:block">
      <div className="border border-copper/30 rounded-sm p-4 bg-copper/5">
        <div className="flex items-center gap-1.5 mb-2 font-mono text-[11px] uppercase tracking-widest text-copper-bright">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
          </svg>
          AI Overview — {track === "technical" ? "Technical" : "News"}
        </div>
        <p className="text-xs text-paper-dim leading-relaxed mb-2">{data.summary}</p>
        <p className="font-mono text-[10px] text-paper-dim/70">{timeAgo(data.generated_at)}</p>
      </div>
    </div>
  );
}
