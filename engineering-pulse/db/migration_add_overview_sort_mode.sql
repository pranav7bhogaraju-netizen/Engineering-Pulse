-- Extends feed_overviews to store a separate summary per (track, sort_mode)
-- combination, so the overview panel can match whichever sort the visitor
-- has selected (Top vs Newest) instead of always summarizing Top-ranked
-- items regardless of what's actually being shown.

ALTER TABLE feed_overviews DROP CONSTRAINT feed_overviews_pkey;
ALTER TABLE feed_overviews ADD COLUMN IF NOT EXISTS sort_mode TEXT NOT NULL DEFAULT 'top'
    CHECK (sort_mode IN ('top', 'new'));
ALTER TABLE feed_overviews ADD PRIMARY KEY (track, sort_mode);
