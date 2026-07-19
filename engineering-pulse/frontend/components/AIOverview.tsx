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

export default function AIOverview({ track }: { track: "all" | "technical" | "news" }) {
  const [overviews, setOverviews] = useState<Record<string, OverviewData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/overview")
      .then((res) => res.json())
      .then((data) => setOverviews(data.overviews ?? {}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const tracksToShow = track === "all" ? ["technical", "news"] : [track];
  const visible = tracksToShow.filter((t) => overviews[t]);
  if (visible.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 -mt-px">
      <div className="grid md:grid-cols-2 gap-4 py-6">
        {visible.map((t) => (
          <div key={t} className="border border-copper/30 rounded-sm p-4 bg-copper/5">
            <div className="flex items-center justify-between mb-2 font-mono text-[11px] uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-copper-bright">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
                </svg>
                AI Overview — {t === "technical" ? "Technical" : "News"}
              </span>
              <span className="text-paper-dim">{timeAgo(overviews[t].generated_at)}</span>
            </div>
            <p className="text-sm text-paper-dim leading-relaxed">{overviews[t].summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
