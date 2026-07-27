import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { useAuth } from "../features/auth/context/AuthContext";
import { useListings } from "../features/listings/hooks/useListings";
import { CATEGORIES, SORT_OPTIONS, DEFAULT_FILTERS } from "../shared/lib/constants";
import { Button, Divider } from "../design";
import CategoryFilter from "../features/listings/components/CategoryFilter";
import PriceFilter from "../features/listings/components/PriceFilter";
import LocationFilter from "../features/listings/components/LocationFilter";
import ListingGrid from "../features/listings/components/ListingGrid";
import Pagination from "../features/listings/components/Pagination";
import MobileFilterDrawer from "../features/listings/components/MobileFilterDrawer";
import ActiveFilters from "../features/listings/components/ActiveFilters";

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

export default function HomePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => readFiltersFromURL(searchParams), [searchParams]);

  const [searchInput, setSearchInput] = useState(filters.search);

  const timerRef = useRef(null);
  const filtersRef = useRef(filters);
  const committedSearchRef = useRef(filters.search);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    filtersRef.current = filters;
    if (filters.search !== committedSearchRef.current) {
      committedSearchRef.current = filters.search;
      setSearchInput(filters.search);
      clearTimeout(timerRef.current);
    }
  }, [filters]);

  const { listings, loading, error, totalCount, totalPages } = useListings(filters);

  const commitFilters = useCallback(
    (newFilters) => {
      const sp = filtersToParams(newFilters);
      setSearchParams(sp, { replace: true });
    },
    [setSearchParams]
  );

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

  const setFilter = useCallback(
    (key, value) => {
      commitFilters({ ...filtersRef.current, [key]: value, page: 1 });
    },
    [commitFilters]
  );

  const handleDrawerApply = useCallback(
    (draft) => {
      commitFilters(draft);
      setSearchInput(draft.search);
      committedSearchRef.current = draft.search;
      clearTimeout(timerRef.current);
    },
    [commitFilters]
  );

  const handleClearAll = useCallback(() => {
    commitFilters({ ...DEFAULT_FILTERS });
    setSearchInput("");
    committedSearchRef.current = "";
    clearTimeout(timerRef.current);
  }, [commitFilters]);

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

  return (
    <>
      <section className="bg-background pb-16 lg:pb-24 pt-8 lg:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-text-primary leading-[1.1] tracking-tight">
              Find what you need,{" "}
              <span className="text-accent">rent it today</span>
            </h1>
            <p className="mt-4 text-lg text-text-secondary max-w-lg mx-auto">
              Browse thousands of items available for rent in your area. From tools to cameras, find everything you need.
            </p>

            <div className="mt-8 bg-white dark:bg-surface-secondary rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="flex-[2] px-4 py-2.5 text-left">
                <label className="block text-xs font-medium text-text-secondary mb-0.5">Search</label>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search rentals..."
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
                />
              </div>
              <div className="flex-1 px-4 py-2.5 text-left">
                <label className="block text-xs font-medium text-text-secondary mb-0.5">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilter("location", e.target.value)}
                  placeholder="Where?"
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
                />
              </div>
              <div className="flex-1 px-4 py-2.5 text-left">
                <label className="block text-xs font-medium text-text-secondary mb-0.5">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilter("category", e.target.value)}
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="p-1 flex items-stretch">
                <button
                  className="w-full sm:w-auto bg-accent text-white rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 justify-center"
                  aria-label="Search"
                >
                  <Search size={16} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 lg:pb-12">
        <ActiveFilters
          filters={filters}
          onClear={handleClearAll}
          onRemove={handleRemoveFilter}
        />

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

        <ListingGrid
          listings={listings}
          loading={loading}
          error={error}
          emptyMessage="No listings match your filters."
          onClearFilters={handleClearAll}
        />

        <Pagination
          page={filters.page}
          totalPages={totalPages}
          onPageChange={(p) => setFilter("page", p)}
        />

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
    </>
  );
}
