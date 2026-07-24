/**
 * useAvailability — Fetches blocked date ranges for a listing.
 *
 * Queries the `availability` table for a given listing_id where
 * `is_blocked = true` and returns the rows as an array of date range
 * objects. Also exposes a `refetch` callback so the parent can force
 * a re-query after mutations (insert/delete).
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";

/**
 * @param {string|null} listingId - UUID of the listing to fetch availability for
 * @returns {{
 *   blockedRanges: Array<{id: string, listing_id: string, start_date: string, end_date: string, is_blocked: boolean, reason: string|null, created_at: string}>,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: () => Promise<void>
 * }}
 */
export function useAvailability(listingId) {
  const [blockedRanges, setBlockedRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Bump this counter to trigger a re-fetch from the effect below.
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-fetch on mount and when listingId or refreshKey changes
  useEffect(() => {
    if (!listingId) return;

    let cancelled = false;

    const run = async () => {
      const { data, error: fetchError } = await supabase
        .from("availability")
        .select("*")
        .eq("listing_id", listingId)
        .eq("is_blocked", true)
        .order("start_date", { ascending: true });

      if (!cancelled) {
        if (fetchError) {
          setError(fetchError.message);
          setBlockedRanges([]);
        } else {
          setBlockedRanges(data ?? []);
        }
        setLoading(false);
      }
    };

    run();

    return () => { cancelled = true; };
  }, [listingId, refreshKey]);

  /** Re-run the fetch to pick up mutations made by the parent. */
  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { blockedRanges, loading, error, refetch };
}
