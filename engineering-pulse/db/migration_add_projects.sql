CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    materials TEXT NOT NULL,       -- full materials/parts list, one item per line
    instructions TEXT NOT NULL,    -- complete step-by-step, written/supplemented by us
    source_url TEXT,               -- the original project this is based on, if any
    source_name TEXT,              -- e.g. "Instructables", "Hackster.io"
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_domains (
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    domain_slug TEXT REFERENCES domains(slug),
    PRIMARY KEY (project_id, domain_slug)
);

CREATE INDEX idx_project_domains_domain ON project_domains(domain_slug);
