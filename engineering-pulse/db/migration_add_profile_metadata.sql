-- created_at: when the account was first created. Note this only reflects
-- the true join date for accounts created AFTER this migration runs —
-- existing accounts will show this migration's run date as a reasonable
-- fallback, since NextAuth's adapter schema didn't originally track this.
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- profile_image_prompt: the text prompt used to AI-generate the current
-- profile picture, if it was AI-generated. NULL for regular uploads, or
-- if no picture has been set at all.
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_prompt TEXT;
