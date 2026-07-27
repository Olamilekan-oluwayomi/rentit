import { useState, useEffect } from "react";
import { supabase } from "../../../shared/lib/supabase";

export function useLandingStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [listingsRes, hostsRes, avgRes] = await Promise.allSettled([
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
      ]);

      if (cancelled) return;

      const activeListings = listingsRes.status === "fulfilled" ? listingsRes.value.count || 0 : 0;
      const trustedHosts = hostsRes.status === "fulfilled" ? hostsRes.value.count || 0 : 0;
      const avgRating = avgRes.status === "fulfilled" && avgRes.value.data.length > 0
        ? (avgRes.value.data.reduce((s, r) => s + Number(r.average_rating), 0) / avgRes.value.data.length).toFixed(1)
        : null;

      const citiesRes = await supabase
        .from("listings")
        .select("location")
        .eq("is_active", true)
        .not("location", "is", null)
        .not("location", "eq", "");

      const locations = citiesRes.status === "fulfilled"
        ? new Set(citiesRes.data.map((r) => r.location.trim().toLowerCase()))
        : new Set();

      setStats({
        activeListings,
        citiesServed: locations.size || 0,
        trustedHosts,
        avgRating,
      });
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, []);

  return { stats, loading };
}
