-- Fix: @auth/pg-adapter has hardcoded table names (users, accounts,
-- sessions, verification_token) with no way to configure a prefix. Rename
-- our tables to match exactly, and move the original "users" table (used
-- for saved_items/user_domain_follows, not yet wired into any UI) out of
-- the way first so the name is free.

ALTER TABLE users RENAME TO app_users;

ALTER TABLE auth_users RENAME TO users;
ALTER TABLE auth_accounts RENAME TO accounts;
ALTER TABLE auth_sessions RENAME TO sessions;
ALTER TABLE auth_verification_token RENAME TO verification_token;
