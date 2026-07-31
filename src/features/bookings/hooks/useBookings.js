/*
|--------------------------------------------------------------------------
| useBookings.js
|--------------------------------------------------------------------------
|
| Fetches bookings for the current user in either direction.
|
| Purpose: Returns bookings for 'rentals' (renter view), 'requests' (pending owner),
|          or 'rented-out' (approved/completed owner).
| Inputs: type ("rentals" | "requests" | "rented-out")
| Outputs: { data, loading, error, refetch }
| Side effects: Supabase queries; two-step fetch for owner views
|
|--------------------------------------------------------------------------
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
          listings ( id, title, images, daily_price, owner_id )
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
          listings ( id, title, images, owner_id ),
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
  }, [user, type]);

  useEffect(() => {
    Promise.resolve().then(() => fetchBookings());
  }, [fetchBookings]);

  const refetch = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { data, loading, error, refetch };
}
