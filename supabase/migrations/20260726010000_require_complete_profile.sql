-- Require a complete profile (full_name + avatar_url) before creating
-- bookings, messages, or listings.  A reusable SQL function keeps the
-- check DRY across all three INSERT policies.

-- 1. Reusable profile-completion check
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
      AND  char_length(trim(full_name)) >= 2
  );
$$;

-- 2. Bookings — require complete profile to create a booking
-- Drop the old permissive insert policy if it exists, then create the
-- new one that bundles the profile check.
DO $$
BEGIN
  -- Only drop if the old policy exists (idempotent migration)
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can create bookings'
      AND tablename  = 'bookings'
  ) THEN
    DROP POLICY "Users can create bookings" ON public.bookings;
  END IF;
END $$;

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    renter_id = auth.uid()
    AND public.has_complete_profile(auth.uid())
  );

-- 3. Messages — require complete profile to send a message
-- The existing policy allows inserts; we replace it with a stricter one.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can send messages for their bookings'
      AND tablename  = 'messages'
  ) THEN
    DROP POLICY "Users can send messages for their bookings" ON public.messages;
  END IF;
END $$;

CREATE POLICY "Users can send messages for their bookings"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.has_complete_profile(auth.uid())
    AND booking_id IN (
      SELECT b.id FROM public.bookings b
      WHERE b.renter_id = auth.uid()
         OR b.listing_id IN (
           SELECT l.id FROM public.listings l WHERE l.owner_id = auth.uid()
         )
    )
  );

-- 4. Listings — require complete profile to create a listing
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Owners can create listings'
      AND tablename  = 'listings'
  ) THEN
    DROP POLICY "Owners can create listings" ON public.listings;
  END IF;
END $$;

CREATE POLICY "Owners can create listings"
  ON public.listings FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
    AND public.has_complete_profile(auth.uid())
  );
