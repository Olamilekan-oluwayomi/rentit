/**
 * HomePage — Main landing/browse page for the RentIt marketplace.
 *
 * Displays a hero section, search bar, category + sort filters, a listing
 * grid, and a floating "create listing" button for authenticated users.
 *
 * Search state is synced to URL query params (?q=...) so results are
 * shareable and bookmarkable.
 */

import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useListings } from "../hooks/useListings";
import { SORT_OPTIONS } from "../lib/constants";
import CategoryFilter from "../components/listings/CategoryFilter";
import ListingGrid from "../components/listings/ListingGrid";

/**
 * @returns {JSX.Element} The home/browse page with search, filters, and listing grid.
 */
export default function HomePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search is seeded from the URL so deep-links work out of the box.
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");

  // Memoize filters to avoid unnecessary re-renders in useListings.
  const filters = useMemo(
    () => ({ search, category, sort }),
    [search, category, sort]
  );

  const { listings, loading, error } = useListings(filters);

  /**
   * Syncs the search query to the URL when the user submits the form.
   * Empty queries remove the param entirely for cleaner URLs.
   * @param {React.FormEvent} e
   */
  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      setSearchParams({ q });
    } else {
      setSearchParams({});
    }
  };

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
      <form onSubmit={handleSearch} className="mb-6">
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rentals..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>
      </form>

      {/* Filters row: category chips on the left, sort dropdown on the right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <CategoryFilter value={category} onChange={setCategory} />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="flex-shrink-0 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-transparent text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Listings grid — handles loading, error, and empty states internally */}
      <ListingGrid
        listings={listings}
        loading={loading}
        error={error}
        emptyMessage="No listings match your filters."
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
