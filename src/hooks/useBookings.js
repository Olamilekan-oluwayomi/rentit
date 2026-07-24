/**
 * useBookings — Fetches bookings for either a renter or a listing owner.
 *
 * When type is 'renter', returns all bookings where the current user is the
 * renter, joined with the listing title and first image.
 *
 * When type is 'owner', returns all bookings for listings owned by the current
 * user, joined with the listing title and the renter's full name / avatar.
 *
 * Results are ordered by created_at descending (newest first).
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

/**
 * @param {{ type: "renter" | "owner" }} options
 * @returns {{
 *   bookings: Array<object>,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: () => Promise<void>
 * }}
 */
export function useBookings({ type }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchBookings = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    let query;

    if (type === "renter") {
      // Renter view: fetch bookings where the current user is the renter.
      // Join listing data (title + first image) for display.
      query = supabase
        .from("bookings")
        .select(`
          id,
          listing_id,
          renter_id,
          start_date,
          end_date,
          total_price,
          status,
          owner_message,
          created_at,
          updated_at,
          listings ( title, images, daily_price )
        `)
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false });
    } else {
      // Owner view: fetch bookings for listings owned by the current user.
      // Join listing title and renter profile (name + avatar).
      query = supabase
        .from("bookings")
        .select(`
          id,
          listing_id,
          renter_id,
          start_date,
          end_date,
          total_price,
          status,
          owner_message,
          created_at,
          updated_at,
          listings ( title, images, daily_price ),
          profiles:renter_id ( full_name, avatar_url )
        `)
        .eq("listings.owner_id", user.id)
        .order("created_at", { ascending: false });
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setBookings([]);
    } else {
      setBookings(data ?? []);
    }

    setLoading(false);
  }, [user, type]);

  useEffect(() => {
    (async () => {
      await fetchBookings();
    })();
  }, [fetchBookings]);

  /** Force a re-fetch to pick up mutations made elsewhere. */
  const refetch = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refetch };
}
