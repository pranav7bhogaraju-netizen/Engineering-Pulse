ALTER TABLE resources ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'curated'
    CHECK (source IN ('curated', 'community'));
ALTER TABLE resources ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id) ON DELETE SET NULL;
