-- ─────────────────────────────────────────────────────────────────────
-- 20260806000000_reconcile_drifted_schema.sql
--
-- Reconciles the live database with the migrations in this directory.
--
-- WHY THIS FILE EXISTS
-- The linked database has no `supabase_migrations.schema_migrations` table at
-- all. Its schema was created by pasting SQL into the Supabase SQL editor, so
-- the CLI had no record of what had run and reported all 11 migration files as
-- pending. An audit of the live database found the schema partially applied:
--
--   Applied   20260726000000  messages table + RLS
--   Applied   20260726010000  has_complete_profile() + insert policies
--   Applied   20260728000000  favorites table + RLS
--   MISSING   20260729000000  profiles.provider absent; handle_new_user() was
--                             still the pre-Google-OAuth version, so Google
--                             sign-ins created profiles with no name or avatar
--   MISSING   20260730000000  has_complete_profile() still required full_name
--                             while the app (ProfileContext.isProfileComplete)
--                             requires avatar_url + location, so the DB gate and
--                             the UI gate disagreed
--   MISSING   20260801000000  conversation_hidden table absent, though
--                             useConversations.js and useDeleteConversation.js
--                             both query it — hiding a conversation was broken
--   Applied   20260802000000  listings update policy
--   Applied   20260803000000  push_subscriptions table + RLS
--   Applied   20260804000000  web push helper, trigger functions, triggers
--
-- Rather than re-running migrations whose SQL was written against a schema this
-- database does not have, this file applies the end state of the three missing
-- ones. They are then recorded as applied, so `supabase db push` is a no-op and
-- the recorded history matches reality.
--
-- profiles.email is added here because 20260729000000's handle_new_user()
-- inserts it but this database never had the column — that migration could not
-- have run successfully as written. Existing rows are backfilled from
-- auth.users so no profile loses its address.
--
-- Fully idempotent: every statement is IF NOT EXISTS / DROP IF EXISTS guarded.
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- 1. Columns the hardened signup trigger writes to.
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT;

COMMENT ON COLUMN public.profiles.provider IS 'Auth method the account was created with (email, google, ...)';

-- Backfill from auth.users. Safe on an empty or already-populated table.
UPDATE public.profiles p
   SET email = u.email
  FROM auth.users u
 WHERE u.id = p.id
   AND (p.email IS NULL OR p.email = '')
   AND u.email IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────
-- 2. Google-aware handle_new_user() (end state of 20260729000000).
--    Google stores the display name under 'name' and the avatar under
--    'picture'; email/password signup sends 'full_name'. Coalesce across all
--    of them so both paths populate name + avatar.
-- ─────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_full_name  text;
  v_avatar_url text;
  v_provider   text;
BEGIN
  v_provider := COALESCE(
    NEW.raw_app_meta_data ->> 'provider',
    (NEW.raw_user_meta_data ->> 'provider'),
    'email'
  );

  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(
      (NEW.raw_user_meta_data ->> 'given_name') || ' ' ||
      (NEW.raw_user_meta_data ->> 'family_name')
    ), ' ')
  );

  v_avatar_url := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'picture'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'avatar_url'), '')
  );

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    provider
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data ->> 'email', ''),
    COALESCE(v_full_name, ''),
    v_avatar_url,
    v_provider
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- 3. Profile completion gate (end state of 20260730000000).
--    Must match ProfileContext.isProfileComplete: avatar_url + location.
--    Without this the database kept accepting writes from users the UI was
--    still blocking, and vice versa.
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.has_complete_profile(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   public.profiles
    WHERE  id = uid
      AND  avatar_url IS NOT NULL
      AND  location IS NOT NULL
      AND  trim(location) != ''
  );
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 4. Per-user conversation hiding (end state of 20260801000000).
--    20260801000000 used bare CREATE POLICY, which errors on re-run, so the
--    policies are dropped first here.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_hidden (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deleted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_hidden_user
  ON conversation_hidden(user_id);

ALTER TABLE conversation_hidden ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own hidden conversations" ON conversation_hidden;
CREATE POLICY "Users can view their own hidden conversations"
  ON conversation_hidden FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can hide conversations for themselves" ON conversation_hidden;
CREATE POLICY "Users can hide conversations for themselves"
  ON conversation_hidden FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own hidden records" ON conversation_hidden;
CREATE POLICY "Users can delete their own hidden records"
  ON conversation_hidden FOR DELETE
  USING (user_id = auth.uid());
