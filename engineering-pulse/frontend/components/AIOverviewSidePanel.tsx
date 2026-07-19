"use client";

import { useEffect, useState } from "react";

interface OverviewData {
  summary: string;
  generated_at: string;
}

export default function AIOverviewSidePanel({
  track,
  sort,
}: {
  track: "technical" | "news";
  sort: "top" | "new";
}) {
  const [overviews, setOverviews] = useState<Record<string, OverviewData>>({});

  useEffect(() => {
    fetch("/api/overview")
      .then((res) => res.json())
      .then((json) => setOverviews(json.overviews?.[track] ?? {}))
      .catch(() => {});
  }, [track]);

  const data = overviews[sort];
  if (!data) return null;

  const sortLabel = sort === "top" ? "Top-ranked" : "Newest";

  return (
    <div className="border border-copper/30 rounded-sm p-4 bg-copper/5">
      <div className="flex items-center gap-1.5 mb-2 font-mono text-[11px] uppercase tracking-widest text-copper-bright">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
        </svg>
        AI Overview — {track === "technical" ? "Technical" : "News"}
      </div>
      <p className="font-mono text-[10px] text-paper-dim/70 uppercase tracking-wide mb-2">
        {sortLabel}
      </p>
      <p className="text-xs text-paper-dim leading-relaxed">{data.summary}</p>
    </div>
  );
}
