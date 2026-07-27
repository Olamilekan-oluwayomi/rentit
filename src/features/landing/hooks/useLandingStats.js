/*
|--------------------------------------------------------------------------
| useLandingStats.js
|--------------------------------------------------------------------------
|
| Fetches aggregate stats for the landing page hero section.
|
| Purpose: Returns active listings count, unique cities, trusted hosts,
| and average rating.
|
| Optimization:
| All four database queries now execute in parallel instead of making the
| cities query wait for the first three to complete.
|
|--------------------------------------------------------------------------
*/

import { useState, useEffect } from "react";
import { supabase } from "../../../shared/lib/supabase";

export function useLandingStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [
        listingsRes,
        hostsRes,
        avgRes,
        citiesRes,
      ] = await Promise.allSettled([
        supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),

        supabase
          .from("listings")
          .select("owner_id", { count: "exact", head: true })
          .eq("is_active", true),

        supabase
          .from("profiles")
          .select("average_rating")
          .not("average_rating", "is", null)
          .not("rating_count", "eq", 0),

        supabase
          .from("listings")
          .select("location")
          .eq("is_active", true)
          .not("location", "is", null)
          .not("location", "eq", ""),
      ]);

      if (cancelled) return;

      const activeListings =
        listingsRes.status === "fulfilled"
          ? listingsRes.value.count || 0
          : 0;

      const trustedHosts =
        hostsRes.status === "fulfilled"
          ? hostsRes.value.count || 0
          : 0;

      const avgRating =
        avgRes.status === "fulfilled" &&
        avgRes.value.data.length > 0
          ? (
              avgRes.value.data.reduce(
                (sum, row) => sum + Number(row.average_rating),
                0
              ) / avgRes.value.data.length
            ).toFixed(1)
          : null;

      const locations =
        citiesRes.status === "fulfilled"
          ? new Set(
              citiesRes.value.data.map((row) =>
                row.location.trim().toLowerCase()
              )
            )
          : new Set();

      setStats({
        activeListings,
        citiesServed: locations.size,
        trustedHosts,
        avgRating,
      });

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading };
}