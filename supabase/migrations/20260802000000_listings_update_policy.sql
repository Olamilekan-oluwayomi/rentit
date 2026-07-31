-- Fix the RLS UPDATE policy on listings so owners can toggle is_active
-- ("Remove from Browse" / "Restore to Browse") and edit any other field.
--
-- Background:
--   The listings table is created manually in the Supabase dashboard, so
--   its original RLS policies are not versioned in this repo — only the
--   INSERT policy ("Owners can create listings") is re-created by
--   20260726010000_require_complete_profile.sql.
--
--   "Remove from Browse" / "Restore to Browse" issue
--     UPDATE listings SET is_active = ... WHERE id = ...
--   which failed with "new row violates row-level security policy for
--   table 'listings'". That error means an existing UPDATE policy's
--   WITH CHECK clause rejected the new row — if no UPDATE policy existed
--   at all, RLS would silently filter the row instead of erroring.
--
-- Fix: drop whatever UPDATE policies exist on listings (by any name,
-- since the manual one is not versioned) and create the canonical
-- owner-only UPDATE policy.

-- 1. Make sure RLS is enabled (no-op if already enabled).
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing UPDATE policies on listings so the new policy is
--    the only UPDATE policy. Uses pg_policies because the old policy
--    name is unknown/unversioned; dropping it prevents two competing
--    UPDATE policies with conflicting WITH CHECK clauses.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM   pg_policies
    WHERE  schemaname = 'public'
      AND  tablename  = 'listings'
      AND  cmd        = 'UPDATE'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.listings', pol.policyname);
  END LOOP;
END $$;

-- 3. Canonical owner-only UPDATE policy.
--    USING      — the existing row must be one of my listings.
--    WITH CHECK — the updated row must still belong to me. owner_id is
--                 never modified by any current write path, so toggling
--                 is_active (or editing title/price) always passes.
CREATE POLICY "Owners can update own listings"
  ON public.listings FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Verification (run in the Supabase SQL editor after applying):
--   SELECT policyname, cmd, qual, with_check
--   FROM   pg_policies
--   WHERE  schemaname = 'public' AND tablename = 'listings'
--   ORDER  BY cmd;
-- Expect a single UPDATE row named "Owners can update own listings".
