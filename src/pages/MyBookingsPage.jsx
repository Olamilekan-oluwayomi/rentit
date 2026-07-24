/**
 * MyBookingsPage — Renter's booking history and management.
 *
 * Displays all bookings made by the current user, with the ability
 * to cancel pending requests.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useBookings } from "../hooks/useBookings";
import { supabase } from "../lib/supabase";
import { useToast } from "../contexts/ToastContext";
import { getListingImageUrl } from "../utils/storage";
import StatusBadge from "../components/bookings/StatusBadge";

/**
 * @returns {JSX.Element} Renter's bookings page.
 */
export default function MyBookingsPage() {
  const { data: bookings, loading, error, refetch } = useBookings("rentals");
  const { addToast } = useToast();
  const [cancellingId, setCancellingId] = useState(null);

  /**
   * Cancel a pending booking by updating its status to 'cancelled'.
   */
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-white/5 rounded w-1/3" />
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-gray-200 dark:bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16 text-center">
        <p className="text-text-secondary text-lg mb-4">{error}</p>
        <Link to="/" className="text-sm font-medium text-accent hover:underline">
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-2">
        My Bookings
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        View and manage your booking requests.
      </p>

      {bookings.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-10 text-center space-y-3">
          <p className="text-text-secondary">You haven&apos;t made any bookings yet.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
          >
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const listing = booking.listings;
            const firstImage = getListingImageUrl(listing?.images?.[0]);
            const isPending = booking.status === "pending";
            const isCancelling = cancellingId === booking.id;

            return (
              <div
                key={booking.id}
                className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Listing thumbnail */}
                  <div className="w-full sm:w-20 h-20 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={listing?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Booking details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-heading font-semibold text-text-primary truncate">
                          {listing?.title}
                        </h3>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                      <span>
                        {format(parseISO(booking.start_date), "MMM d")} –{" "}
                        {format(parseISO(booking.end_date), "MMM d, yyyy")}
                      </span>
                      <span className="font-medium text-text-primary">
                        ${booking.total_price}
                      </span>
                    </div>

                    {booking.owner_message && (
                      <p className="text-xs text-text-secondary italic">
                        Owner: {booking.owner_message}
                      </p>
                    )}

                    {/* Cancel button for pending bookings */}
                    {isPending && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleCancel(booking)}
                          disabled={isCancelling}
                          className="px-4 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isCancelling ? "Cancelling..." : "Cancel Request"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
