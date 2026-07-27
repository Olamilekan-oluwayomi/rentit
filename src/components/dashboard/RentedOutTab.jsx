/**
 * RentedOutTab — Displays approved/completed bookings for the owner's listings.
 *
 * Shows bookings where the current user owns the related listing and the
 * booking status is 'approved' or 'completed'. Read-only view with no actions.
 */

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useBookings } from "../../features/bookings/hooks/useBookings";
import StatusBadge from "../../features/bookings/components/StatusBadge";
import ListingThumbnail from "../../shared/components/ListingThumbnail";
import RenterInfo from "../../shared/components/RenterInfo";
import BookingMeta from "../../shared/components/BookingMeta";
import BookingListSkeleton from "../../shared/components/BookingListSkeleton";
import EmptyState from "../../shared/components/EmptyState";
import AnimatedList, { AnimatedListItem } from "../../shared/components/AnimatedList";
import ReviewPrompt from "../../features/reviews/components/ReviewPrompt";

export default function RentedOutTab() {
  const { data: bookings, loading, error } = useBookings("rented-out");

  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewUpdate = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  if (loading) return <BookingListSkeleton />;

  if (error) {
    return <p className="text-text-secondary text-sm py-8 text-center">{error}</p>;
  }

  if (bookings.length === 0) {
    return <EmptyState message="You haven't rented anything out yet." />;
  }

  return (
    <AnimatedList className="space-y-3">
      {bookings.map((booking) => {
        const listing = booking.listings;
        const renter = booking.profiles;

        return (
          <AnimatedListItem key={booking.id}>
            <div className="bg-surface rounded-2xl border border-border p-4 hover:border-accent/30 transition-colors">
              <Link to={`/booking/${booking.id}`} className="block">
                <div className="flex flex-col sm:flex-row gap-4">
                  <ListingThumbnail listing={listing} />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-heading font-semibold text-text-primary truncate">{listing?.title}</h3>
                        <RenterInfo renter={renter} />
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <BookingMeta booking={booking} />
                  </div>
                </div>
              </Link>

              <ReviewPrompt
                booking={booking}
                revieweeId={booking.renter_id}
                onReviewUpdate={handleReviewUpdate}
              />
            </div>
          </AnimatedListItem>
        );
      })}
    </AnimatedList>
  );
}
