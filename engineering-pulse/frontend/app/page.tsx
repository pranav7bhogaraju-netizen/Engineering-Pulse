"use client";

import { useEffect, useMemo, useState } from "react";
import DomainFilter from "@/components/DomainFilter";
import TrackToggle from "@/components/TrackToggle";
import SortToggle from "@/components/SortToggle";
import ThemeToggle from "@/components/ThemeToggle";
import SignalCard from "@/components/SignalCard";
import { SignalItem } from "@/lib/mockData";

export default function Home() {
  const [domain, setDomain] = useState("all");
  const [track, setTrack] = useState<"all" | "technical" | "news">("all");
  const [sort, setSort] = useState<"top" | "new">("top");
  const [items, setItems] = useState<SignalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (domain !== "all") params.set("domain", domain);
    if (track !== "all") params.set("track", track);
    params.set("sort", sort);

    setLoading(true);
    fetch(`/api/feed?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items ?? []);
        setError(data.error ?? null);
      })
      .catch(() => setError("Could not reach the feed API."))
      .finally(() => setLoading(false));
  }, [domain, track, sort]);

  const topPerDomain = useMemo(() => {
    const seen = new Set<string>();
    return [...items]
      .sort((a, b) => b.score - a.score)
      .filter((item) => {
        const key = item.domains[0];
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6);
  }, [items]);

  return (
    <main className="min-h-screen">
      {/* Hero — blueprint sheet with registration marks and a ticker */}
      <section className="relative border-b border-paper-dim/20 bg-blueprint bg-blueprint px-6 py-14 md:py-20 overflow-hidden">
        <div className="crop-mark crop-mark--tl m-4" />
        <div className="crop-mark crop-mark--tr m-4" />
        <div className="crop-mark crop-mark--bl m-4" />
        <div className="crop-mark crop-mark--br m-4" />

        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
          <ThemeToggle />
        </div>

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
        {topPerDomain.length > 0 && (
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
                  <span className="text-copper">{item.domains[0]?.toUpperCase()}</span> —{" "}
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Filters + feed */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <DomainFilter active={domain} onChange={setDomain} />
            </div>
            <TrackToggle active={track} onChange={setTrack} />
          </div>
          <div className="flex justify-end">
            <SortToggle active={sort} onChange={setSort} />
          </div>
        </div>

        {loading ? (
          <p className="font-mono text-sm text-paper-dim py-12 text-center">
            Loading signals...
          </p>
        ) : error ? (
          <p className="font-mono text-sm text-copper py-12 text-center max-w-md mx-auto">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="font-mono text-sm text-paper-dim py-12 text-center max-w-md mx-auto">
            No signals in the database yet — run <code>python ingest.py</code>{" "}
            in the ingestion folder to pull real content.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item) => (
              <SignalCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
