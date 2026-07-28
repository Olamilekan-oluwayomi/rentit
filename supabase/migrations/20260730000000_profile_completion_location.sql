-- Update has_complete_profile to check location instead of full_name.
--
-- The front-end profile completion gate now requires avatar_url + location
-- (instead of the previous avatar_url + full_name).  This migration keeps
-- the DB-level RLS INSERT policies (bookings, messages, listings) in sync
-- with the front-end gate so they reject insertions from profiles that
-- haven't cleared the gate.
--
-- Run this in the Supabase SQL Editor after deploying the code changes.

CREATE OR REPLACE FUNCTION public.has_complete_profile(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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