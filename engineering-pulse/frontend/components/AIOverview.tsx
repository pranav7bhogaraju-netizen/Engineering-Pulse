"use client";

import { useEffect, useState } from "react";

interface OverviewData {
  summary: string;
  generated_at: string;
}

export default function AIOverviewAccordion({ sort }: { sort: "top" | "new" }) {
  const [expanded, setExpanded] = useState(false);
  const [overviews, setOverviews] = useState<Record<string, Record<string, OverviewData>>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/overview")
      .then((res) => res.json())
      .then((json) => setOverviews(json.overviews ?? {}))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const newsData = overviews.news?.[sort];
  const techData = overviews.technical?.[sort];

  if (loaded && !newsData && !techData) return null; // nothing to show yet

  const sortLabel = sort === "top" ? "Top-ranked" : "Newest";

  return (
    <div className="mb-8 border border-copper/30 rounded-sm overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-copper/5 hover:bg-copper/10 transition-colors"
      >
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-copper-bright">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
          </svg>
          AI Overview
        </span>
        <span
          className={`text-paper-dim transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {/* Accordion body — animates via max-height since height:auto can't
          transition directly, same pattern as the nav panel's accordion. */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
          expanded ? "max-h-[600px]" : "max-h-0"
        }`}
      >
        <div className="p-4 grid sm:grid-cols-2 gap-4 border-t border-copper/20">
          {newsData && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-copper-bright mb-1">
                News <span className="text-paper-dim/70 normal-case">— {sortLabel}</span>
              </p>
              <p className="text-xs text-paper-dim leading-relaxed">{newsData.summary}</p>
            </div>
          )}
          {techData && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-copper-bright mb-1">
                Technical <span className="text-paper-dim/70 normal-case">— {sortLabel}</span>
              </p>
              <p className="text-xs text-paper-dim leading-relaxed">{techData.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
