# Engineering Pulse

AI-ranked engineering signals — a Tech Spindle-style aggregator, scoped to
engineering: EE, ME, CE, Aero, Chem, Materials, Biomedical, and CS/Software.
Built for both students and working engineers, with two ranked tracks per
domain: **Technical** (papers, datasheets, standards) and **News**
(product launches, industry moves, blog posts).

## Structure

```
engineering-pulse/
├── frontend/          Next.js 14 (App Router) + TypeScript + Tailwind
│   ├── app/
│   │   ├── page.tsx           Homepage — hero + domain filter + feed
│   │   ├── layout.tsx         Root layout, fonts, metadata
│   │   ├── globals.css        Design tokens (see below)
│   │   └── api/feed/route.ts  Feed API (mock data now, swap for DB later)
│   ├── components/
│   │   ├── SignalCard.tsx     Spec-sheet styled item card
│   │   ├── DomainFilter.tsx   Domain chip filter bar
│   │   └── TrackToggle.tsx    Technical / News toggle
│   └── lib/mockData.ts        Placeholder feed data, shaped like the real schema
├── db/
│   └── schema.sql      Postgres schema: sources, items, domains, scores, users
└── ingestion/
    ├── config.py        Source list per domain/track
    ├── sources.py        Fetchers: arXiv, Hacker News, RSS
    ├── classify.py       LLM-based domain + track tagging (stub)
    ├── rank.py            Two-track scoring logic (stub)
    └── ingest.py           Orchestrator — run this on a schedule (cron)
```

## Design direction

Palette pulls from engineering drafting paper and PCB traces, not the usual
AI-generated cream/terracotta look:
- `--ink` `#0E1A2B` — blueprint navy background
- `--paper` `#EDEAE0` — drafting paper foreground
- `--copper` `#C77B3B` — signal accent (links, active states)
- `--pcb-green` `#4C8066` — secondary accent (technical track)
- `--grid` `rgba(237,234,224,0.08)` — blueprint gridlines

Type: **Space Grotesk** for headlines (technical, geometric), **Inter** for
body copy, **IBM Plex Mono** for domain tags, timestamps, and scores — reads
like a datasheet label.

Signature element: the hero renders as a live blueprint sheet — grid
background, corner registration marks, and a scrolling ticker of the top
signal per domain, styled like a title block on an engineering drawing.

## Getting started

```bash
# Frontend
cd frontend
npm install
npm run dev

# Database
createdb engineering_pulse
psql engineering_pulse < ../db/schema.sql

# Ingestion (run once, then put on a cron schedule)
cd ../ingestion
pip install -r requirements.txt
python ingest.py
```

## Next steps once this scaffold is running

1. Wire `app/api/feed/route.ts` to query Postgres instead of `mockData.ts`.
2. Fill in real API keys in `ingestion/config.py` (arXiv needs none, IEEE/ACM
   do).
3. Replace the `classify.py` and `rank.py` stubs with real Anthropic API
   calls (see the "structured outputs in JSON" pattern — have the model
   return `{"domain": [...], "track": "technical"|"news", "score": 0-100}`).
4. Add auth (NextAuth or Clerk) once you want saved items / domain follows.
