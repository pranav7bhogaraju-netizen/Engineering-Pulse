-- Upvotes and saves for Projects.
-- Mirrors resource_votes / saved_resources exactly so the behavior and
-- queries stay consistent with the Resources feature.

CREATE TABLE project_votes (
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE saved_projects (
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_saved_projects_user ON saved_projects(user_id);
