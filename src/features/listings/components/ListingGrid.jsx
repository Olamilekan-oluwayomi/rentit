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
