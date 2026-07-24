/**
 * useListingBookingStats — Returns a map of booking counts per listing.
 *
 * Given an array of listing IDs, queries the bookings table and returns
 * an object mapping each listing_id to its total booking count.
 * Used on the My Listings tab to show "X requests" per listing.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";

/**
 * @param {string[]} listingIds - Array of listing UUIDs to get stats for
 * @returns {{
 *   stats: Record<string, number>,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: () => void
 * }}
 */
export function useListingBookingStats(listingIds) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = useCallback(async () => {
    if (!listingIds || listingIds.length === 0) {
      setStats({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("bookings")
      .select("listing_id")
      .in("listing_id", listingIds);

    if (fetchError) {
      setError(fetchError.message);
      setStats({});
    } else {
      // Count occurrences client-side
      const counts = {};
      for (const row of data ?? []) {
        counts[row.listing_id] = (counts[row.listing_id] || 0) + 1;
      }
      setStats(counts);
    }

    setLoading(false);
  }, [listingIds?.join(","), refreshKey]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { stats, loading, error, refetch };
}
