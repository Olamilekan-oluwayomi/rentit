/*
|--------------------------------------------------------------------------
| useListingBookingStats.js
|--------------------------------------------------------------------------
|
| Returns a map of booking counts per listing.
|
| Purpose: Given listing IDs, maps each listing_id to its total booking count.
|          Used on the My Listings tab to show "X requests" per listing.
| Inputs: listingIds (string[])
| Outputs: { stats (Record<string,number>), loading, error, refetch }
| Side effects: Supabase select query
|
|--------------------------------------------------------------------------
*/

import { useCallback, useEffect, useRef, useState } from "react";
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

  // The parent recomputes `listingIds` on every render, so the fetch callback
  // depends on a stable joined key while reading the current values from a ref.
  const listingIdsKey = listingIds?.join(",") ?? "";
  const listingIdsRef = useRef(listingIds);
  useEffect(() => {
    listingIdsRef.current = listingIds;
  }, [listingIds]);

  const fetchStats = useCallback(async () => {
    if (!listingIdsKey) {
      setStats({});
      setLoading(false);
      return;
    }

    const ids = listingIdsRef.current;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("bookings")
      .select("listing_id")
      .in("listing_id", ids);

    if (fetchError) {
      setError(fetchError.message);
      setStats({});
    } else {
      const counts = {};
      for (const row of data ?? []) {
        counts[row.listing_id] = (counts[row.listing_id] || 0) + 1;
      }
      setStats(counts);
    }

    setLoading(false);
  }, [listingIdsKey]);

  useEffect(() => {
    Promise.resolve().then(() => fetchStats());
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch };
}
