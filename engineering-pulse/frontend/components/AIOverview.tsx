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

function Panel({
  track,
  data,
  side,
}: {
  track: "technical" | "news";
  data: OverviewData;
  side: "left" | "right";
}) {
  return (
    <div
      className={`hidden 2xl:block fixed top-32 ${
        side === "left" ? "left-6" : "right-6"
      } w-56 z-10`}
    >
      <div className="border border-copper/30 rounded-sm p-4 bg-copper/5 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center gap-1.5 mb-2 font-mono text-[11px] uppercase tracking-widest text-copper-bright">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
          </svg>
          {track === "technical" ? "Technical" : "News"}
        </div>
        <p className="text-xs text-paper-dim leading-relaxed mb-2">{data.summary}</p>
        <p className="font-mono text-[10px] text-paper-dim/70">{timeAgo(data.generated_at)}</p>
      </div>
    </div>
  );
}

export default function AIOverview() {
  const [overviews, setOverviews] = useState<Record<string, OverviewData>>({});

  useEffect(() => {
    fetch("/api/overview")
      .then((res) => res.json())
      .then((data) => setOverviews(data.overviews ?? {}))
      .catch(() => {});
  }, []);

  return (
    <>
      {overviews.news && <Panel track="news" data={overviews.news} side="left" />}
      {overviews.technical && <Panel track="technical" data={overviews.technical} side="right" />}
    </>
  );
}
