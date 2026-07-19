-- Stores one AI-generated overview per track ("technical" and "news"),
-- regenerated each ingestion cycle rather than per page-visit — keeps
-- Gemini API usage low and every visitor sees the same current summary.

CREATE TABLE feed_overviews (
    track TEXT PRIMARY KEY CHECK (track IN ('technical', 'news')),
    summary TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT now()
);
