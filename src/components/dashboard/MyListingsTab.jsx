/**
 * MyListingsTab — Displays the current owner's listings with management actions.
 *
 * Shows both active and inactive listings (owner management view).
 * Each row displays thumbnail, title, active/inactive status, view count,
 * booking request count, and edit/delete actions.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useToast } from "../../shared/contexts/ToastContext";
import { useListings } from "../../features/listings/hooks/useListings";
import { useListingBookingStats } from "../../features/bookings/hooks/useListingBookingStats";
import { supabase } from "../../shared/lib/supabase";
import { Button, Badge } from "../../design";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import ListingThumbnail from "../../shared/components/ListingThumbnail";
import BookingListSkeleton from "../../shared/components/BookingListSkeleton";
import EmptyState from "../../shared/components/EmptyState";
import AnimatedList, { AnimatedListItem } from "../../shared/components/AnimatedList";

export default function MyListingsTab() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const {
    listings,
    loading,
    error,
    totalCount,
    refreshListings,
  } = useListings({
    owner_id: user?.id,
    includeInactive: true,
    sort: "newest",
    page: 1,
    limit: 50,
  });

  const listingIds = listings.map((l) => l.id);
  const { stats: bookingStats } = useListingBookingStats(listingIds);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    if (deleteTarget.images?.length) {
      await supabase.storage.from("listing-images").remove(deleteTarget.images);
    }

    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", deleteTarget.id);

    setDeleting(false);
    setDeleteTarget(null);

    if (deleteError) {
      addToast(deleteError.message, "error");
    } else {
      addToast("Listing deleted.");
      refreshListings();
    }
  };

  if (loading) return <BookingListSkeleton />;

  if (error) {
    return <p className="text-text-secondary text-sm py-8 text-center">{error}</p>;
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        message="You haven't created any listings yet."
        actionLabel="Create Your First Listing"
        actionTo="/listings/new"
      />
    );
  }

  return (
    <>
      <p className="text-xs text-text-secondary mb-4">{totalCount} listing{totalCount !== 1 ? "s" : ""}</p>

      <AnimatedList className="space-y-3">
        {listings.map((listing) => (
          <AnimatedListItem key={listing.id}>
            <div
              className="bg-surface rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-4"
            >
            <ListingThumbnail listing={listing} />

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-heading font-semibold text-text-primary truncate">{listing.title}</h3>
                <Badge variant={listing.is_active ? "success" : "neutral"}>
                  {listing.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                <span>${listing.daily_price}/day</span>
                <span>{listing.view_count ?? 0} views</span>
                <span>{bookingStats[listing.id] ?? 0} requests</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 sm:self-center">
              <Link to={`/listings/${listing.id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteTarget(listing)}
              >
                Delete
              </Button>
            </div>
            </div>
          </AnimatedListItem>
        ))}
      </AnimatedList>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Listing"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
