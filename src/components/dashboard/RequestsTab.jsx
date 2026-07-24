/**
 * RequestsTab — Displays incoming booking requests for the owner's listings.
 *
 * Shows all bookings where the related listing's owner_id is the current user,
 * with renter info, listing details, status badge, and approve/decline actions
 * for pending requests.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useBookings } from "../../hooks/useBookings";
import { useToast } from "../../contexts/ToastContext";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../bookings/StatusBadge";

/**
 * @returns {JSX.Element} The owner's requests tab.
 */
export default function RequestsTab() {
  const { data: bookings, loading, error, refetch } = useBookings("requests");
  const { addToast } = useToast();
  const [actionId, setActionId] = useState(null);

  /** Approve a booking: update status and block the dates in availability. */
  const handleApprove = async (booking) => {
    setActionId(booking.id);

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "approved" })
      .eq("id", booking.id);

    if (updateError) {
      addToast(updateError.message, "error");
      setActionId(null);
      return;
    }

    // Auto-block the booked dates in the availability table so the calendar
    // immediately reflects them and no other renter can select them.
    const { error: blockError } = await supabase.from("availability").insert({
      listing_id: booking.listing_id,
      start_date: booking.start_date,
      end_date: booking.end_date,
      is_blocked: true,
      reason: "Booked",
    });

    if (blockError) {
      console.error("Failed to auto-block dates on approval:", blockError);
    }

    addToast("Booking approved.");
    setActionId(null);
    refetch();
  };

  /** Decline a booking by setting status to 'declined'. */
  const handleDecline = async (booking) => {
    setActionId(booking.id);

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "declined" })
      .eq("id", booking.id);

    if (updateError) {
      addToast(updateError.message, "error");
    } else {
      addToast("Booking declined.");
      refetch();
    }

    setActionId(null);
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
      <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-10 text-center">
        <p className="text-text-secondary">No booking requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const listing = booking.listings;
        const renter = booking.profiles;
        const firstImage = listing?.images?.[0] || null;
        const isPending = booking.status === "pending";
        const isLoading = actionId === booking.id;

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
                  <div className="min-w-0">
                    <h3 className="text-sm font-heading font-semibold text-text-primary truncate">{listing?.title}</h3>
                    {renter && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden shrink-0">
                          {renter.avatar_url ? (
                            <img src={renter.avatar_url} alt={renter.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-text-secondary">
                              {renter.full_name?.[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-text-secondary">{renter.full_name}</span>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                  <span>
                    {format(parseISO(booking.start_date), "MMM d")} – {format(parseISO(booking.end_date), "MMM d, yyyy")}
                  </span>
                  <span className="font-medium text-text-primary">${booking.total_price}</span>
                </div>
              </div>

              {/* Approve/Decline actions for pending bookings */}
              {isPending && (
                <div className="flex items-center gap-2 shrink-0 sm:self-center" onClick={(e) => e.preventDefault()}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleApprove(booking);
                    }}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDecline(booking);
                    }}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "..." : "Decline"}
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
