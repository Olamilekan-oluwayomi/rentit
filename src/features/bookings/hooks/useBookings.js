/**
 * useBookings — Fetches bookings for the current user in either direction.
 *
 * When type is 'rentals', returns all bookings where the current user is the
 * renter, joined with listing data (title, images, daily_price).
 *
 * When type is 'requests', returns pending bookings for listings owned by the
 * current user, joined with listing data (title, images) and the renter's
 * profile (full_name, avatar_url). Only status='pending' is returned since
 * this tab is for action needed, not history.
 *
 * When type is 'rented-out', returns approved/completed bookings for listings
 * owned by the current user — things currently or previously rented out.
 *
 * Results are ordered by created_at descending (newest first).
 * If the user is null, returns empty data without error.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../auth/context/AuthContext";

/**
 * @param {"rentals" | "requests" | "rented-out"} type
 * @returns {{
 *   data: Array<object>,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: () => void
 * }}
 */
export function useBookings(type) {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let query;

    if (type === "rentals") {
      // Renter view: bookings where current user is the renter.
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
      // Owner view: bookings for listings owned by the current user.
      // Two-step fetch because PostgREST embedded-resource filters (e.g.
      // .eq("listings.owner_id", ...)) don't reliably filter parent rows.
      // Step 1: get the current user's listing IDs.
      const { data: ownedListings, error: listingsError } = await supabase
        .from("listings")
        .select("id")
        .eq("owner_id", user.id);

      if (listingsError) {
        setError(listingsError.message);
        setData([]);
        setLoading(false);
        return;
      }

      const listingIds = (ownedListings ?? []).map((l) => l.id);

      // If the user owns no listings, there can be no incoming requests.
      if (listingIds.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Determine which statuses to fetch based on type.
      const statusFilter =
        type === "requests" ? ["pending"] : ["approved", "completed"];

      // Step 2: fetch bookings where listing_id is in the user's listings.
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
          listings ( title, images ),
          profiles:renter_id ( full_name, avatar_url )
        `)
        .in("listing_id", listingIds)
        .in("status", statusFilter)
        .order("created_at", { ascending: false });
    }

    const { data: bookings, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setData([]);
    } else {
      setData(bookings ?? []);
    }

    setLoading(false);
  }, [user, type, refreshKey]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { data, loading, error, refetch };
}
