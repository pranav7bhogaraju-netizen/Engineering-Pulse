-- Profile picture (data URL — either an uploaded image/GIF or an
-- AI-generated SVG, both stored as base64 text; no separate file storage
-- service needed since these stay reasonably small), display phrase, and
-- freeform about section.

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_phrase TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS about TEXT;
