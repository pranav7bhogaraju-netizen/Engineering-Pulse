-- Migration: authentication + forum/discussion tables
-- Run this once in Neon's SQL Editor, in addition to the original schema.sql

-- Required for gen_random_uuid(), used as the default for all UUID ids below
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Auth tables follow the schema expected by @auth/pg-adapter (NextAuth's
-- official Postgres adapter) so login sessions/accounts are managed
-- correctly without hand-rolled session logic.

CREATE TABLE auth_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    password_hash TEXT  -- only set for email+password accounts; NULL for Google/magic-link-only users
);

CREATE TABLE auth_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, "providerAccountId")
);

CREATE TABLE auth_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL,
    "sessionToken" TEXT UNIQUE NOT NULL
);

CREATE TABLE auth_verification_token (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Forum tables

CREATE TABLE forum_threads (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    linked_item_id INT REFERENCES items(id) ON DELETE SET NULL,  -- optional: "discuss this article"
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE forum_posts (
    id SERIAL PRIMARY KEY,
    thread_id INT NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_forum_threads_created ON forum_threads(created_at DESC);
CREATE INDEX idx_forum_posts_thread ON forum_posts(thread_id);
