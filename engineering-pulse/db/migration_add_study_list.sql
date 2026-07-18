-- Extends saved_resources (already created) to support the Study List:
-- personal notes per saved resource, and a manual ordering position.

ALTER TABLE saved_resources ADD COLUMN IF NOT EXISTS position INT;
ALTER TABLE saved_resources ADD COLUMN IF NOT EXISTS note TEXT;

-- Backfill position for any rows that predate this migration, in save order
WITH numbered AS (
    SELECT resource_id, user_id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS rn
    FROM saved_resources
    WHERE position IS NULL
)
UPDATE saved_resources sr
SET position = numbered.rn
FROM numbered
WHERE sr.resource_id = numbered.resource_id AND sr.user_id = numbered.user_id;
