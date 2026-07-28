-- Ensure profiles table has all columns consumed by the frontend and
-- that RLS policies exist so authenticated users can manage their own row.
--
-- Schema inspection (run against live DB) confirmed:
--   - terms_accepted_at / terms_version / privacy_accepted_at /
--     privacy_version / bio / location all exist in public.profiles
--   - RLS is enabled
--   - Some policies already exist (but which ones is unknown)
--
-- This migration is fully idempotent — every statement uses IF NOT EXISTS
-- so it is safe to apply on a fresh project or one with partial schema.
--
-- Run this in the Supabase SQL Editor after deploying code changes.

-- ─────────────────────────────────────────────────────────────────────
-- 1. Add columns consumed by the frontend (no-op if they already exist)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version      TEXT,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_version    TEXT,
  ADD COLUMN IF NOT EXISTS bio                TEXT;

COMMENT ON COLUMN public.profiles.terms_accepted_at  IS 'Timestamp when the user accepted the Terms of Service';
COMMENT ON COLUMN public.profiles.terms_version      IS 'Version of Terms the user agreed to (TERMS_VERSION constant)';
COMMENT ON COLUMN public.profiles.privacy_accepted_at IS 'Timestamp when the user accepted the Privacy Policy';
COMMENT ON COLUMN public.profiles.privacy_version    IS 'Version of Privacy Policy the user agreed to (PRIVACY_VERSION constant)';
COMMENT ON COLUMN public.profiles.bio                IS 'Short biography / about-me text shown on the user profile';

-- ─────────────────────────────────────────────────────────────────────
-- 2. Enable Row Level Security (no-op if already enabled)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 3. RLS policies (IF NOT EXISTS so existing policies are never recreated)
-- ─────────────────────────────────────────────────────────────────────

CREATE POLICY IF NOT EXISTS "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
