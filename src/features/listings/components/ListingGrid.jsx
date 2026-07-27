/**
 * ListingGrid — Displays listings in a responsive grid with loading/error/empty states.
 *
 * Route: Listings page ("/listings") — main listing display area.
 * Responsibilities: Handles all visual states: loading (skeleton grid), error (empty state with
 *   message), empty (with optional "Clear Filters" action), and data (animated grid of ListingCard).
 * Dependencies: ListingCard, ListingSkeleton, AnimatedList, design/EmptyState + Button.
 * Important notes: The grid uses AnimatedList for staggered entrance animations. Passes
 *   onClearFilters to show a button in the empty state when filters are active.
 */

import ListingCard from "./ListingCard";
import ListingSkeleton from "./ListingSkeleton";
import AnimatedList, { AnimatedListItem } from "../../../shared/components/AnimatedList";
import { EmptyState, Button } from "../../../design";

export default function ListingGrid({
  listings,
  loading,
  error,
  emptyMessage = "No listings found.",
  onClearFilters,
}) {
  if (loading) return <ListingSkeleton count={10} />;

  if (error) {
    return (
      <div className="py-12">
        <EmptyState
          title="Something went wrong"
          description={error}
        />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title="No results found"
          description={emptyMessage}
          action={
            onClearFilters ? (
              <Button variant="outline" onClick={onClearFilters}>
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 lg:gap-6">
      {listings.map((listing) => (
        <AnimatedListItem key={listing.id}>
          <ListingCard listing={listing} />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}
