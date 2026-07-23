/**
 * useListings — Central data-fetching hook for the listing browse page.
 *
 * Queries the `listings` table for active rows and supports:
 *   - Free-text search (title + description via ilike)
 *   - Category filter (exact match)
 *   - Location filter (ilike partial match)
 *   - Price range filter (min / max daily_price)
 *   - Sort order
 *   - Server-side pagination via Supabase range()
 *
 * Returns both the page of results and total count so the
 * Pagination component can calculate total pages.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { LISTINGS_PER_PAGE } from "../lib/constants";

/**
 * @param {object} filters
 * @param {string}  filters.search    - Free-text search term
 * @param {string}  filters.category  - Category name or "All"
 * @param {string}  filters.location  - Location ilike term
 * @param {string|number} filters.minPrice - Minimum daily price
 * @param {string|number} filters.maxPrice - Maximum daily price
 * @param {string}  filters.sort      - Sort key (newest|oldest|price_asc|price_desc)
 * @param {number}  filters.page      - 1-indexed current page
 * @param {number}  [filters.limit]   - Items per page (default LISTINGS_PER_PAGE)
 * @returns {{ listings, loading, error, totalCount, totalPages, refreshListings }}
 */
export function useListings(filters = {}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const limit = filters.limit || LISTINGS_PER_PAGE;
  const page = filters.page || 1;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    // ── Count query (total matching rows, no range) ──────────
    // Needed so Pagination can derive totalPages client-side.
    let countQuery = supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // ── Data query ───────────────────────────────────────────
    let dataQuery = supabase
      .from("listings")
      .select("*")
      .eq("is_active", true);

    // ── Apply filters to both queries ────────────────────────
    // Category
    if (filters.category && filters.category !== "All") {
      countQuery = countQuery.eq("category", filters.category);
      dataQuery = dataQuery.eq("category", filters.category);
    }

    // Text search (title + description)
    if (filters.search) {
      const term = filters.search.trim();
      const filter = `title.ilike.%${term}%,description.ilike.%${term}%`;
      countQuery = countQuery.or(filter);
      dataQuery = dataQuery.or(filter);
    }

    // Location (case-insensitive partial match)
    if (filters.location) {
      const loc = filters.location.trim();
      countQuery = countQuery.ilike("location", `%${loc}%`);
      dataQuery = dataQuery.ilike("location", `%${loc}%`);
    }

    // Price range
    const min = Number(filters.minPrice);
    const max = Number(filters.maxPrice);
    if (min > 0) {
      countQuery = countQuery.gte("daily_price", min);
      dataQuery = dataQuery.gte("daily_price", min);
    }
    if (max > 0) {
      countQuery = countQuery.lte("daily_price", max);
      dataQuery = dataQuery.lte("daily_price", max);
    }

    // ── Sorting ──────────────────────────────────────────────
    switch (filters.sort) {
      case "oldest":
        dataQuery = dataQuery.order("created_at", { ascending: true });
        break;
      case "price_asc":
        dataQuery = dataQuery.order("daily_price", { ascending: true });
        break;
      case "price_desc":
        dataQuery = dataQuery.order("daily_price", { ascending: false });
        break;
      case "newest":
      default:
        dataQuery = dataQuery.order("created_at", { ascending: false });
        break;
    }

    // ── Execute count ────────────────────────────────────────
    const { count, error: countError } = await countQuery;
    if (countError) {
      setError(countError.message);
      setListings([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    setTotalCount(count || 0);

    // ── Execute data with pagination range ───────────────────
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error: fetchError } = await dataQuery.range(from, to);

    if (fetchError) {
      setError(fetchError.message);
      setListings([]);
    } else {
      setListings(data);
    }

    setLoading(false);
  }, [
    filters.search,
    filters.category,
    filters.location,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    filters.page,
    limit,
  ]);

  useEffect(() => {
    (async () => {
      await fetchListings();
    })();
  }, [fetchListings]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return { listings, loading, error, totalCount, totalPages, refreshListings: fetchListings };
}
