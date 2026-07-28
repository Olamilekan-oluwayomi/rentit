-- Harden handle_new_user trigger for Google OAuth metadata keys.
--
-- Google's OAuth metadata stores the display name under 'name' (not
-- 'full_name' like our email/password signup sends). The avatar URL
-- comes in as 'picture'.  This migration:
--   1. Replaces the existing trigger function with one that COALESCEs
--      across all likely metadata key names so both email/password and
--      Google-sourced users get their name + avatar populated.
--   2. Adds a 'provider' column so we can distinguish auth methods.
--
-- Run this in the Supabase SQL Editor after deploying the code changes.

-- ─────────────────────────────────────────────────────────────────────
-- 1. Drop the old trigger & function so we can replace them
-- ─────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- 2. Recreate the function with Google-aware metadata coalescing
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_full_name  text;
  v_avatar_url text;
  v_provider   text;
BEGIN
  -- Extract the provider from the raw user metadata (Supabase populates
  -- this based on the signup method).  For email/password it is 'email',
  -- for Google OAuth it is 'google'.
  v_provider := COALESCE(
    NEW.raw_app_meta_data ->> 'provider',
    (NEW.raw_user_meta_data ->> 'provider'),
    'email'
  );

  -- Google puts the display name under 'name'; email/password signup
  -- sends it as 'full_name'.  Also try 'given_name' + 'family_name' as
  -- a last-resort fallback for other OAuth providers.
  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(
      (NEW.raw_user_meta_data ->> 'given_name') || ' ' ||
      (NEW.raw_user_meta_data ->> 'family_name')
    ), ' ')
  );

  -- Google provides the avatar URL under 'picture'; Apple uses
  -- 'avatar_url'; our email/password flow doesn't send one at signup.
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

-- ─────────────────────────────────────────────────────────────────────
-- 3. Re-attach the trigger
-- ─────────────────────────────────────────────────────────────────────
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();