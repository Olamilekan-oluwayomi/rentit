/**
 * MyRentalsTab — Displays the current user's rental history.
 *
 * Shows all bookings where the current user is the renter, with listing
 * details, date range, status badge, and cancel action for pending/approved bookings.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useBookings } from "../../features/bookings/hooks/useBookings";
import { useToast } from "../../shared/contexts/ToastContext";
import { supabase } from "../../shared/lib/supabase";
import StatusBadge from "../../features/bookings/components/StatusBadge";
import ListingThumbnail from "../../shared/components/ListingThumbnail";
import BookingMeta from "../../shared/components/BookingMeta";
import BookingListSkeleton from "../../shared/components/BookingListSkeleton";
import EmptyState from "../../shared/components/EmptyState";

export default function MyRentalsTab() {
  const { data: bookings, loading, error, refetch } = useBookings("rentals");
  const { addToast } = useToast();
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancel = async (booking) => {
    setCancellingId(booking.id);

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking.id);

    if (updateError) {
      addToast(updateError.message, "error");
    } else {
      addToast("Booking cancelled.");
      refetch();
    }

    setCancellingId(null);
  };

  if (loading) return <BookingListSkeleton />;

  if (error) {
    return <p className="text-text-secondary text-sm py-8 text-center">{error}</p>;
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        message="You haven't requested any rentals yet."
        actionLabel="Browse Listings"
        actionTo="/"
      />
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const listing = booking.listings;
        const canCancel = booking.status === "pending" || booking.status === "approved";
        const isCancelling = cancellingId === booking.id;

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
                  <h3 className="text-sm font-heading font-semibold text-text-primary truncate">{listing?.title}</h3>
                  <StatusBadge status={booking.status} />
                </div>
                <BookingMeta booking={booking} />
              </div>

              {canCancel && (
                <div className="shrink-0 sm:self-center" onClick={(e) => e.preventDefault()}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCancel(booking);
                    }}
                    disabled={isCancelling}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
