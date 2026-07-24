/**
 * RentedOutTab — Displays approved/completed bookings for the owner's listings.
 *
 * Shows bookings where the current user owns the related listing and the
 * booking status is 'approved' or 'completed'. Read-only view with no actions.
 */

import { Link } from "react-router-dom";
import { useBookings } from "../../hooks/useBookings";
import StatusBadge from "../bookings/StatusBadge";
import ListingThumbnail from "../ui/ListingThumbnail";
import RenterInfo from "../ui/RenterInfo";
import BookingMeta from "../ui/BookingMeta";
import BookingListSkeleton from "../ui/BookingListSkeleton";
import EmptyState from "../ui/EmptyState";

export default function RentedOutTab() {
  const { data: bookings, loading, error } = useBookings("rented-out");

  if (loading) return <BookingListSkeleton />;

  if (error) {
    return <p className="text-text-secondary text-sm py-8 text-center">{error}</p>;
  }

  if (bookings.length === 0) {
    return <EmptyState message="You haven't rented anything out yet." />;
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const listing = booking.listings;
        const renter = booking.profiles;

        return (
          <Link
            key={booking.id}
            to={`/booking/${booking.id}`}
            className="block bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-4 hover:shadow-md transition-shadow"
          >
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
        );
      })}
    </div>
  );
}
