-- Engineering Pulse schema

CREATE TABLE domains (
    slug TEXT PRIMARY KEY,       -- 'ee', 'me', 'ce', 'aero', 'chem', 'materials', 'biomed', 'cs'
    label TEXT NOT NULL          -- 'Electrical & Computer', 'Mechanical', ...
);

INSERT INTO domains (slug, label) VALUES
    ('ee', 'Electrical & Computer'),
    ('me', 'Mechanical'),
    ('ce', 'Civil & Structural'),
    ('aero', 'Aerospace'),
    ('chem', 'Chemical'),
    ('materials', 'Materials Science'),
    ('biomed', 'Biomedical'),
    ('cs', 'Software & CS');

CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,               -- 'arXiv eess', 'Hacker News', 'IEEE Spectrum'
    kind TEXT NOT NULL,               -- 'api' | 'rss' | 'scrape'
    track TEXT NOT NULL CHECK (track IN ('technical', 'news')),
    url TEXT NOT NULL,
    poll_interval_minutes INT DEFAULT 60,
    last_polled_at TIMESTAMPTZ
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    source_id INT REFERENCES sources(id),
    external_id TEXT,                 -- DOI, HN id, GUID — used for dedupe
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    summary TEXT,                     -- AI-generated plain-language summary
    raw_excerpt TEXT,                 -- short excerpt only, never full text
    track TEXT NOT NULL CHECK (track IN ('technical', 'news')),
    published_at TIMESTAMPTZ,
    ingested_at TIMESTAMPTZ DEFAULT now(),
    engagement_raw JSONB              -- points/comments/citations as pulled from source
);

CREATE TABLE item_domains (
    item_id INT REFERENCES items(id) ON DELETE CASCADE,
    domain_slug TEXT REFERENCES domains(slug),
    PRIMARY KEY (item_id, domain_slug)
);

CREATE TABLE item_scores (
    item_id INT REFERENCES items(id) ON DELETE CASCADE PRIMARY KEY,
    novelty_score NUMERIC,            -- LLM-assigned, 0-100
    engagement_score NUMERIC,         -- normalized from engagement_raw
    composite_score NUMERIC,          -- final rank input
    scored_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_domain_follows (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    domain_slug TEXT REFERENCES domains(slug),
    PRIMARY KEY (user_id, domain_slug)
);

CREATE TABLE saved_items (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    item_id INT REFERENCES items(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, item_id)
);

CREATE INDEX idx_items_track ON items(track);
CREATE INDEX idx_items_published ON items(published_at DESC);
CREATE INDEX idx_item_domains_domain ON item_domains(domain_slug);
