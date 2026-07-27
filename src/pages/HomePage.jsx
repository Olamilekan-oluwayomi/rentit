/*
|--------------------------------------------------------------------------
| HomePage.jsx
|--------------------------------------------------------------------------
|
| Main browse / search page with hero search section, category filter,
| price/location/sort controls, listing grid, and pagination. Filters
| are persisted to URL search params. Debounces text search (300ms).
|
| Route: /
| Responsibilities: Display and filter listings; manage URL-synced filter state
| Dependencies: useListings hook, CategoryFilter, PriceFilter, LocationFilter,
|               ListingGrid, Pagination, MobileFilterDrawer, ActiveFilters
| Notes: Shows a FAB "New Listing" button for authenticated users.
|
|--------------------------------------------------------------------------
*/

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { useAuth } from "../features/auth/context/AuthContext";
import { useListings } from "../features/listings/hooks/useListings";
import { CATEGORIES, SORT_OPTIONS, DEFAULT_FILTERS } from "../shared/lib/constants";
import { Button } from "../design";
import CategoryFilter from "../features/listings/components/CategoryFilter";
import PriceFilter from "../features/listings/components/PriceFilter";
import LocationFilter from "../features/listings/components/LocationFilter";
import ListingGrid from "../features/listings/components/ListingGrid";
import Pagination from "../features/listings/components/Pagination";
import MobileFilterDrawer from "../features/listings/components/MobileFilterDrawer";
import ActiveFilters from "../features/listings/components/ActiveFilters";
import FadeInSection from "../shared/components/FadeInSection";

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
      <FadeInSection>
        <section className="bg-background pt-10 lg:pt-20 pb-20 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-text-primary leading-[1.05] tracking-tight mb-6">
                Find what you need,{" "}
                <span className="text-accent">rent it today</span>
              </h1>
              <p className="text-lg text-text-secondary max-w-md mx-auto leading-relaxed">
                Browse thousands of items available for rent in your area. From tools to cameras, find everything you need.
              </p>

              <div className="mt-10 bg-white dark:bg-surface-secondary rounded-2xl shadow-lg p-2.5 flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-border">
                <div className="flex-[2] px-5 py-3 text-left">
                  <label className="block text-xs font-medium text-text-muted mb-1">Search</label>
                  <div className="relative rounded-lg focus-within:ring-2 focus-within:ring-accent/40 -mx-2 px-2 py-1 transition-shadow">
                    <input
                      type="text"
                      autoComplete="off"
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search rentals..."
                      className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 px-5 py-3 text-left">
                  <label className="block text-xs font-medium text-text-muted mb-1">Location</label>
                  <div className="relative rounded-lg focus-within:ring-2 focus-within:ring-accent/40 -mx-2 px-2 py-1 transition-shadow">
                    <MapPin size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      autoComplete="address-level2"
                      value={filters.location}
                      onChange={(e) => setFilter("location", e.target.value)}
                      placeholder="Where?"
                      className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none pl-5"
                    />
                  </div>
                </div>
                <div className="flex-1 px-5 py-3 text-left">
                  <label className="block text-xs font-medium text-text-muted mb-1">Category</label>
                  <div className="relative rounded-lg focus-within:ring-2 focus-within:ring-accent/40 -mx-2 px-2 py-1 transition-shadow">
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
                </div>
                <div className="p-1.5 flex items-stretch">
                  <button
                    className="w-full sm:w-auto bg-accent text-white rounded-xl px-7 py-3 text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2.5 justify-center active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    aria-label="Search"
                  >
                    <Search size={17} />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 lg:pb-24 -mt-12 lg:-mt-16 relative z-10">
        <FadeInSection>
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-6">
                Browse by Category
              </h2>
              <p className="text-sm text-text-secondary">
                Find exactly what you need
              </p>
            </div>
            <div className="flex justify-center">
              <CategoryFilter value={filters.category} onChange={(v) => setFilter("category", v)} />
            </div>
          </section>
        </FadeInSection>

        <FadeInSection>
          <section>
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-6">
                  Featured Rentals
                </h2>
                <p className="text-sm text-text-secondary">
                  {totalCount} {totalCount === 1 ? "item" : "items"} available
                </p>
              </div>
            </div>

          <ActiveFilters
            filters={filters}
            onClear={handleClearAll}
            onRemove={handleRemoveFilter}
          />

          <div className="hidden lg:flex items-center gap-4 mb-8">
            <div className="flex-1 max-w-xs">
              <LocationFilter value={filters.location} onChange={(v) => setFilter("location", v)} />
            </div>

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
              <span className="text-sm text-text-muted">
                {totalCount} {totalCount === 1 ? "result" : "results"}
              </span>

              <select
                value={filters.sort}
                onChange={(e) => setFilter("sort", e.target.value)}
                className="px-4 py-2.5 border border-border rounded-lg bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex lg:hidden items-center justify-between gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              leftIcon={SlidersHorizontal}
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open filters"
            >
              Filters
            </Button>

            <span className="text-sm text-text-muted">
              {totalCount} {totalCount === 1 ? "result" : "results"}
            </span>

            <select
              value={filters.sort}
              onChange={(e) => setFilter("sort", e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
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
          </section>
        </FadeInSection>

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