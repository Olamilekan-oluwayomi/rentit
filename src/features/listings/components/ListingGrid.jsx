/**
 * ListingGrid.jsx
 * ----------------
 * Responsive grid container that renders ListingCard components with proper
 * loading (skeleton), empty, and error state handling. Acts as the single
 * entry point for displaying lists of listings across the application.
 */
import ListingCard from "./ListingCard";
import ListingSkeleton from "./ListingSkeleton";
import { AnimatedListItem } from "../../../shared/components/AnimatedList";
import { EmptyState } from "../../../design";
import { Button } from "../../../design";
import { AutoGrid } from "../../../layouts";

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

  // Default state — render the responsive grid of listing cards.
  return (
    <AutoGrid minWidth="240px">
      {listings.map((listing) => (
        <AnimatedListItem key={listing.id}>
          <ListingCard listing={listing} />
        </AnimatedListItem>
      ))}
    </AutoGrid>
  );
}
