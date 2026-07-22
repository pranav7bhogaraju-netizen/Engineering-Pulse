-- Community submissions for Projects, mirroring the resources submission model.
-- Existing projects default to published + curated, so nothing already live is affected.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'pending'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'curated'
    CHECK (source IN ('curated', 'community'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
