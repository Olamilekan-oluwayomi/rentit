/**
 * ListingGrid.jsx
 * ----------------
 * Responsive grid container that renders ListingCard components with proper
 * loading (skeleton), empty, and error state handling. Acts as the single
 * entry point for displaying lists of listings across the application.
 */
import ListingCard from "./ListingCard";
import ListingSkeleton from "./ListingSkeleton";

/**
 * Responsive listing grid with loading, empty, and error states.
 * Renders a 1-4 column responsive grid that adapts to screen width.
 * Handles all edge states so parent components just pass data.
 * @param {{ listings: object[], loading: boolean, error: string|null, emptyMessage: string, onClearFilters?: () => void }} props
 */
export default function ListingGrid({
  listings,
  loading,
  error,
  emptyMessage = "No listings found.",
  onClearFilters,
}) {
  // Show skeleton placeholders while data is being fetched.
  if (loading) return <ListingSkeleton count={8} />;

  // Error state — displays a red icon and the error message.
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    );
  }

  // Empty state — shows message and optional "Clear Filters" button.
  if (listings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <p className="text-text-secondary text-sm mb-4">{emptyMessage}</p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm font-medium text-accent hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  // Default state — render the responsive grid of listing cards.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
