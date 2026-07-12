"use client";

import { useMemo, useState } from "react";
import DomainFilter from "@/components/DomainFilter";
import TrackToggle from "@/components/TrackToggle";
import SignalCard from "@/components/SignalCard";
import { MOCK_ITEMS } from "@/lib/mockData";

export default function Home() {
  const [domain, setDomain] = useState("all");
  const [track, setTrack] = useState<"all" | "technical" | "news">("all");

  const topPerDomain = useMemo(() => {
    // one highest-scoring item per domain, for the hero ticker
    const seen = new Set<string>();
    return MOCK_ITEMS.filter((item) => item.score)
      .sort((a, b) => b.score - a.score)
      .filter((item) => {
        const key = item.domains[0];
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6);
  }, []);

  const filtered = useMemo(() => {
    return MOCK_ITEMS.filter((item) => {
      const domainMatch = domain === "all" || item.domains.includes(domain);
      const trackMatch = track === "all" || item.track === track;
      return domainMatch && trackMatch;
    }).sort((a, b) => b.score - a.score);
  }, [domain, track]);

  return (
    <main className="min-h-screen">
      {/* Hero — blueprint sheet with registration marks and a ticker */}
      <section className="relative border-b border-paper-dim/20 bg-blueprint bg-blueprint px-6 py-14 md:py-20 overflow-hidden">
        <div className="crop-mark crop-mark--tl m-4" />
        <div className="crop-mark crop-mark--tr m-4" />
        <div className="crop-mark crop-mark--bl m-4" />
        <div className="crop-mark crop-mark--br m-4" />

        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper mb-4">
            Rev. 2026.07 — Engineering Signals, Ranked
          </p>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-tight mb-4">
            Engineering Pulse
          </h1>
          <p className="text-paper-dim text-base md:text-lg max-w-2xl mx-auto">
            Papers and product launches across every discipline — Electrical,
            Mechanical, Civil, Aerospace, Chemical, Materials, Biomedical, and
            Software — ranked as two separate tracks so depth never gets
            buried by hype.
          </p>
        </div>

        {/* Ticker */}
        <div className="max-w-5xl mx-auto mt-12 border-t border-paper-dim/20 pt-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-3">
            Top signal per domain
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
            {topPerDomain.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-paper-dim hover:text-copper-bright truncate transition-colors"
              >
                <span className="text-copper">{item.domains[0].toUpperCase()}</span> —{" "}
                {item.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + feed */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <DomainFilter active={domain} onChange={setDomain} />
          <TrackToggle active={track} onChange={setTrack} />
        </div>

        {filtered.length === 0 ? (
          <p className="font-mono text-sm text-paper-dim py-12 text-center">
            No signals match this filter yet — check back after the next ingestion run.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <SignalCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
