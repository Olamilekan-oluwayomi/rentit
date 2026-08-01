-- Web Push subscriptions.
--
-- One row per browser/device subscription (a user can be subscribed on
-- phone + desktop + multiple browsers). `endpoint` is unique per
-- subscription because push services mint one endpoint per browser profile.
--
-- The send-notification Edge Function reads these rows with the
-- service_role key, which bypasses RLS. The policies below only let a
-- user manage their own subscriptions from the client (the JWT on their
-- request is pinned to auth.uid()).
--
-- This migration is idempotent — run it in the Supabase SQL Editor.

-- ─────────────────────────────────────────────────────────────────────
-- 1. Table
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON push_subscriptions(user_id);

COMMENT ON TABLE  push_subscriptions IS 'Web Push subscription endpoints per user (one row per browser/device)';
COMMENT ON COLUMN push_subscriptions.endpoint   IS 'Push service endpoint; unique per browser/device';
COMMENT ON COLUMN push_subscriptions.p256dh     IS 'Subscription ECDH public key (base64url)';
COMMENT ON COLUMN push_subscriptions.auth       IS 'Subscription auth secret (base64url)';
COMMENT ON COLUMN push_subscriptions.user_agent IS 'Optional device/browser label for the settings UI';

-- ─────────────────────────────────────────────────────────────────────
-- 2. Row Level Security
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view only their own subscriptions.
-- DROP + CREATE (rather than CREATE POLICY IF NOT EXISTS, which Postgres
-- does not support) keeps this migration idempotent.
DROP POLICY IF EXISTS "Users can view own push subscriptions"
  ON push_subscriptions;
CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Users can only register a subscription for themselves
DROP POLICY IF EXISTS "Users can insert own push subscriptions"
  ON push_subscriptions;
CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only remove their own subscriptions (no UPDATE policy:
-- key rotation is delete + reinsert, RLS denies UPDATE by default)
DROP POLICY IF EXISTS "Users can delete own push subscriptions"
  ON push_subscriptions;
CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (user_id = auth.uid());

-- Verification (run in the Supabase SQL editor after applying):
--   SELECT policyname, cmd, qual, with_check
--   FROM   pg_policies
--   WHERE  schemaname = 'public' AND tablename = 'push_subscriptions'
--   ORDER  BY cmd;
-- Expect SELECT/INSERT/DELETE policies only, all scoped to user_id = auth.uid().
