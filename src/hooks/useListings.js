import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Fetches active listings with optional filtering and sorting.
 * @param {object} filters - { search, category, sort }
 * @returns {{ listings, loading, error, refreshListings }}
 */
export function useListings(filters = {}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("listings")
      .select("*")
      .eq("is_active", true);

    // ── Category filter ──────────────────────────────────────
    if (filters.category && filters.category !== "All") {
      query = query.eq("category", filters.category);
    }

    // ── Text search (title + description) ────────────────────
    if (filters.search) {
      const term = filters.search.trim();
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }

    // ── Sorting ──────────────────────────────────────────────
    switch (filters.sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "price_asc":
        query = query.order("daily_price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("daily_price", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setListings([]);
    } else {
      setListings(data);
    }

    setLoading(false);
  }, [filters.search, filters.category, filters.sort]);

  useEffect(() => {
    (async () => {
      await fetchListings();
    })();
  }, [fetchListings]);

  return { listings, loading, error, refreshListings: fetchListings };
}
