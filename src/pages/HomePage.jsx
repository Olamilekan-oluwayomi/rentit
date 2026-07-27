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
import { Search, SlidersHorizontal } from "lucide-react";
import { useAuth } from "../features/auth/context/AuthContext";
import { useListings } from "../features/listings/hooks/useListings";
import { SORT_OPTIONS, DEFAULT_FILTERS } from "../shared/lib/constants";
import { Input, Button, Divider } from "../design";
import { PageHeader, AutoGrid } from "../layouts";
import CategoryFilter from "../features/listings/components/CategoryFilter";
import PriceFilter from "../features/listings/components/PriceFilter";
import LocationFilter from "../features/listings/components/LocationFilter";
import ListingGrid from "../features/listings/components/ListingGrid";
import Pagination from "../features/listings/components/Pagination";
import MobileFilterDrawer from "../features/listings/components/MobileFilterDrawer";
import ActiveFilters from "../features/listings/components/ActiveFilters";

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
      <PageHeader
        title="Find what you need"
        description="Browse thousands of items available for rent in your area."
        className="mb-8 lg:mb-12"
      />

      <div className="mb-6 max-w-xl">
        <Input
          leadingIcon={Search}
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search rentals..."
          className="rounded-full"
        />
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

        <Divider orientation="vertical" className="h-6" />

        <div className="w-48">
          <LocationFilter value={filters.location} onChange={(v) => setFilter("location", v)} />
        </div>

        <Divider orientation="vertical" className="h-6" />

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

      <div className="flex lg:hidden items-center justify-between gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          leftIcon={SlidersHorizontal}
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open filters"
        >
          Filters
        </Button>

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

      {user && (
        <Link
          to="/listings/new"
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30"
          aria-label="Create new listing"
        >
          <Button
            size="lg"
            className="!rounded-full w-14 h-14 !p-0 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </Link>
      )}
    </div>
  );
}
