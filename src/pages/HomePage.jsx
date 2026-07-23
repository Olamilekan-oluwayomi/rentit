/**
 * HomePage — Main landing/browse page for the RentIt marketplace.
 *
 * Displays a hero section, search bar, full filter bar (category,
 * location, price range, sort), pagination, a listing grid, and a
 * floating "create listing" button for authenticated users.
 *
 * All filter state is persisted in URL query params so results are
 * shareable, bookmarkable, and back-button friendly.
 *
 * Search input is debounced (300ms) to avoid firing a query on
 * every keystroke. Other filters update the URL immediately.
 *
 * URL is the single source of truth — filter state is derived from
 * searchParams on every render. No separate filters state is kept.
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useListings } from "../hooks/useListings";
import { SORT_OPTIONS, DEFAULT_FILTERS } from "../lib/constants";
import CategoryFilter from "../components/listings/CategoryFilter";
import PriceFilter from "../components/listings/PriceFilter";
import LocationFilter from "../components/listings/LocationFilter";
import ListingGrid from "../components/listings/ListingGrid";
import Pagination from "../components/listings/Pagination";
import MobileFilterDrawer from "../components/listings/MobileFilterDrawer";
import ActiveFilters from "../components/listings/ActiveFilters";

// ── Helpers ──────────────────────────────────────────────────────

/** Read filter values from URL search params, falling back to defaults. */
function readFiltersFromURL(sp) {
  return {
    search: sp.get("q") || DEFAULT_FILTERS.search,
    category: sp.get("category") || DEFAULT_FILTERS.category,
    location: sp.get("location") || DEFAULT_FILTERS.location,
    minPrice: sp.get("minPrice") || DEFAULT_FILTERS.minPrice,
    maxPrice: sp.get("maxPrice") || DEFAULT_FILTERS.maxPrice,
    sort: sp.get("sort") || DEFAULT_FILTERS.sort,
    page: parseInt(sp.get("page"), 10) || DEFAULT_FILTERS.page,
  };
}

/** Build URL search params from filter state; omit defaults/empty values. */
function filtersToParams(filters) {
  const sp = new URLSearchParams();
  if (filters.search) sp.set("q", filters.search);
  if (filters.category && filters.category !== "All") sp.set("category", filters.category);
  if (filters.location) sp.set("location", filters.location);
  if (filters.minPrice) sp.set("minPrice", filters.minPrice);
  if (filters.maxPrice) sp.set("maxPrice", filters.maxPrice);
  if (filters.sort && filters.sort !== "newest") sp.set("sort", filters.sort);
  if (filters.page > 1) sp.set("page", String(filters.page));
  return sp;
}

/**
 * @returns {JSX.Element} The home/browse page with search, filters, pagination, and listing grid.
 */
export default function HomePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filters derived from URL (single source of truth) ────
  const filters = useMemo(() => readFiltersFromURL(searchParams), [searchParams]);

  // ── Local search input (for responsive typing) ───────────
  const [searchInput, setSearchInput] = useState(filters.search);

  // ── Refs for debounce and tracking committed values ───────
  const timerRef = useRef(null);
  const filtersRef = useRef(filters);
  const committedSearchRef = useRef(filters.search);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // ── Sync refs and local state when URL changes externally
  // (e.g. browser back/forward). Runs as an effect to avoid
  // writing refs during render. ──────────────────────────────
  useEffect(() => {
    filtersRef.current = filters;

    if (filters.search !== committedSearchRef.current) {
      committedSearchRef.current = filters.search;
      setSearchInput(filters.search);
      clearTimeout(timerRef.current);
    }
  }, [filters]);

  // ── Data fetching ────────────────────────────────────────
  const { listings, loading, error, totalCount, totalPages } = useListings(filters);

  // ── Handlers ─────────────────────────────────────────────

  /** Push new filter values to the URL (the source of truth). */
  const commitFilters = useCallback(
    (newFilters) => {
      const sp = filtersToParams(newFilters);
      setSearchParams(sp, { replace: true });
    },
    [setSearchParams]
  );

  /** Handle search input change — debounce 300ms before updating URL. */
  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        committedSearchRef.current = value;
        commitFilters({ ...filtersRef.current, search: value, page: 1 });
      }, 300);
    },
    [commitFilters]
  );

  /** Set a single filter key immediately (no debounce). */
  const setFilter = useCallback(
    (key, value) => {
      commitFilters({ ...filtersRef.current, [key]: value, page: 1 });
    },
    [commitFilters]
  );

  /** Apply filters from the mobile drawer. */
  const handleDrawerApply = useCallback(
    (draft) => {
      commitFilters(draft);
      setSearchInput(draft.search);
      committedSearchRef.current = draft.search;
      clearTimeout(timerRef.current);
    },
    [commitFilters]
  );

  /** Reset all filters and URL to defaults. */
  const handleClearAll = useCallback(() => {
    commitFilters({ ...DEFAULT_FILTERS });
    setSearchInput("");
    committedSearchRef.current = "";
    clearTimeout(timerRef.current);
  }, [commitFilters]);

  /** Remove a single filter chip by key. */
  const handleRemoveFilter = useCallback(
    (key) => {
      const newFilters = { ...filtersRef.current, [key]: DEFAULT_FILTERS[key], page: 1 };
      commitFilters(newFilters);
      if (key === "search") {
        setSearchInput("");
        committedSearchRef.current = "";
        clearTimeout(timerRef.current);
      }
    },
    [commitFilters]
  );

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      {/* Hero section */}
      <div className="mb-8 lg:mb-12">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-3">
          Find what you need
        </h1>
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl">
          Browse thousands of items available for rent in your area.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search rentals..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Active filter chips (shown when filters are active) */}
      <ActiveFilters
        filters={filters}
        onClear={handleClearAll}
        onRemove={handleRemoveFilter}
      />

      {/* Desktop filter bar: category chips + price + location + sort */}
      <div className="hidden lg:flex items-center gap-3 mb-8 flex-wrap">
        <CategoryFilter value={filters.category} onChange={(v) => setFilter("category", v)} />

        <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />

        <div className="w-48">
          <LocationFilter value={filters.location} onChange={(v) => setFilter("location", v)} />
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />

        <div className="w-56">
          <PriceFilter
            min={filters.minPrice}
            max={filters.maxPrice}
            onChange={(min, max) => {
              commitFilters({ ...filtersRef.current, minPrice: min, maxPrice: max, page: 1 });
            }}
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-text-secondary">
            {totalCount} {totalCount === 1 ? "result" : "results"}
          </span>

          <select
            value={filters.sort}
            onChange={(e) => setFilter("sort", e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-transparent text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile/tablet: filter toggle + sort + result count */}
      <div className="flex lg:hidden items-center justify-between gap-3 mb-6">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>

        <span className="text-xs text-text-secondary">
          {totalCount} {totalCount === 1 ? "result" : "results"}
        </span>

        <select
          value={filters.sort}
          onChange={(e) => setFilter("sort", e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-transparent text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Listings grid — handles loading, error, and empty states internally */}
      <ListingGrid
        listings={listings}
        loading={loading}
        error={error}
        emptyMessage="No listings match your filters."
        onClearFilters={handleClearAll}
      />

      {/* Server-side pagination */}
      <Pagination
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(p) => setFilter("page", p)}
      />

      {/* Mobile filter drawer (bottom sheet) */}
      <MobileFilterDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onApply={handleDrawerApply}
        filters={filters}
      />

      {/* Floating action button — only visible to authenticated users */}
      {user && (
        <Link
          to="/listings/new"
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-accent text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center justify-center z-30"
          aria-label="Create new listing"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}
