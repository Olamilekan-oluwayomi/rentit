/**
 * MyRentalsTab — Displays the current user's rental history.
 *
 * Shows all bookings where the current user is the renter, with listing
 * details, date range, status badge, and cancel action for pending/approved bookings.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useBookings } from "../../hooks/useBookings";
import { useToast } from "../../contexts/ToastContext";
import { supabase } from "../../lib/supabase";
import { getListingImageUrl } from "../../utils/storage";
import StatusBadge from "../bookings/StatusBadge";

/**
 * @returns {JSX.Element} The renter's rentals tab.
 */
export default function MyRentalsTab() {
  const { data: bookings, loading, error, refetch } = useBookings("rentals");
  const { addToast } = useToast();
  const [cancellingId, setCancellingId] = useState(null);

  /** Cancel a booking by updating its status to 'cancelled'. */
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 bg-gray-200 dark:bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-text-secondary text-sm py-8 text-center">{error}</p>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-10 text-center space-y-3">
        <p className="text-text-secondary">You haven&apos;t requested any rentals yet.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const listing = booking.listings;
        const firstImage = getListingImageUrl(listing?.images?.[0]);
        const canCancel = booking.status === "pending" || booking.status === "approved";
        const isCancelling = cancellingId === booking.id;

        return (
          <Link
            key={booking.id}
            to={`/booking/${booking.id}`}
            className="block bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Thumbnail */}
              <div className="w-full sm:w-20 h-20 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0">
                {firstImage ? (
                  <img src={firstImage} alt={listing?.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">No image</div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-heading font-semibold text-text-primary truncate">{listing?.title}</h3>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                  <span>
                    {format(parseISO(booking.start_date), "MMM d")} – {format(parseISO(booking.end_date), "MMM d, yyyy")}
                  </span>
                  <span className="font-medium text-text-primary">${booking.total_price}</span>
                </div>
              </div>

              {/* Cancel action */}
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
