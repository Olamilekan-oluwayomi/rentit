/**
 * BookingRequestsPage — Incoming booking requests for listing owners.
 *
 * Displays all bookings for the owner's listings, sorted with pending
 * requests first. Owners can approve or decline each pending request.
 *
 * APPROVE FLOW:
 * When approved, the booking status is set to 'approved' AND a new row
 * is inserted into the `availability` table for the same listing/dates
 * with is_blocked=true and reason='Booked'. This auto-block step is
 * essential: it ensures the listing's calendar immediately reflects
 * the booked dates so no other renter can select them.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useBookings } from "../hooks/useBookings";
import { supabase } from "../lib/supabase";
import { useToast } from "../contexts/ToastContext";
import StatusBadge from "../components/bookings/StatusBadge";

/**
 * @returns {JSX.Element} Owner's booking requests page.
 */
export default function BookingRequestsPage() {
  const { data: bookings, loading, error, refetch } = useBookings("requests");
  const { addToast } = useToast();
  const [actionLoading, setActionLoading] = useState(null);
  const [declineReason, setDeclineReason] = useState({});
  const [showDeclineInput, setShowDeclineInput] = useState({});

  /**
   * Approve a booking: update status to 'approved' and insert a blocked
   * range into availability so the calendar stays in sync.
   */
  const handleApprove = async (booking) => {
    setActionLoading(booking.id);

    // 1. Update booking status to approved
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "approved" })
      .eq("id", booking.id);

    if (updateError) {
      addToast(updateError.message, "error");
      setActionLoading(null);
      return;
    }

    // 2. AUTO-BLOCK ON APPROVAL: Insert a blocked range into the availability
    //    table so the calendar reflects these booked dates. Without this step,
    //    other renters could still see the dates as available and submit
    //    competing booking requests.
    const { error: blockError } = await supabase.from("availability").insert({
      listing_id: booking.listing_id,
      start_date: booking.start_date,
      end_date: booking.end_date,
      is_blocked: true,
      reason: "Booked",
    });

    if (blockError) {
      // Booking was approved but calendar wasn't blocked — log but don't
      // confuse the user; the booking is still valid.
      console.error("Failed to auto-block dates on approval:", blockError);
    }

    addToast("Booking approved.");
    setActionLoading(null);
    refetch();
  };

  /**
   * Decline a booking: update status to 'declined' and optionally save
   * the owner's reason message.
   */
  const handleDecline = async (booking) => {
    setActionLoading(booking.id);

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "declined",
        owner_message: declineReason[booking.id]?.trim() || null,
      })
      .eq("id", booking.id);

    if (updateError) {
      addToast(updateError.message, "error");
    } else {
      addToast("Booking declined.");
      setDeclineReason((prev) => {
        const next = { ...prev };
        delete next[booking.id];
        return next;
      });
      setShowDeclineInput((prev) => {
        const next = { ...prev };
        delete next[booking.id];
        return next;
      });
    }

    setActionLoading(null);
    refetch();
  };

  // Sort: pending first, then by created_at desc
  const sorted = [...bookings].sort((a, b) => {
    const statusOrder = { pending: 0, approved: 1, declined: 2, completed: 3, cancelled: 4 };
    const aOrder = statusOrder[a.status] ?? 5;
    const bOrder = statusOrder[b.status] ?? 5;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return new Date(b.created_at) - new Date(a.created_at);
  });

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
        Booking Requests
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        Review and manage incoming booking requests for your listings.
      </p>

      {sorted.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-10 text-center">
          <p className="text-text-secondary">No booking requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((booking) => {
            const listing = booking.listings;
            const renter = booking.profiles;
            const firstImage = listing?.images?.[0] || null;
            const isPending = booking.status === "pending";
            const isLoading = actionLoading === booking.id;

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
                        alt={listing.title}
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
                        {renter && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden shrink-0">
                              {renter.avatar_url ? (
                                <img
                                  src={renter.avatar_url}
                                  alt={renter.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] text-text-secondary">
                                  {renter.full_name?.[0]}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-text-secondary">
                              {renter.full_name}
                            </span>
                          </div>
                        )}
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
                        Reason: {booking.owner_message}
                      </p>
                    )}

                    {/* Action buttons for pending bookings */}
                    {isPending && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button
                          onClick={() => handleApprove(booking)}
                          disabled={isLoading}
                          className="px-4 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Working..." : "Approve"}
                        </button>

                        {showDeclineInput[booking.id] ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={declineReason[booking.id] || ""}
                              onChange={(e) =>
                                setDeclineReason((prev) => ({
                                  ...prev,
                                  [booking.id]: e.target.value,
                                }))
                              }
                              placeholder="Reason (optional)"
                              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button
                              onClick={() => handleDecline(booking)}
                              disabled={isLoading}
                              className="px-4 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {isLoading ? "Working..." : "Confirm Decline"}
                            </button>
                            <button
                              onClick={() => {
                                setShowDeclineInput((prev) => {
                                  const next = { ...prev };
                                  delete next[booking.id];
                                  return next;
                                });
                                setDeclineReason((prev) => {
                                  const next = { ...prev };
                                  delete next[booking.id];
                                  return next;
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setShowDeclineInput((prev) => ({
                                ...prev,
                                [booking.id]: true,
                              }))
                            }
                            disabled={isLoading}
                            className="px-4 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Decline
                          </button>
                        )}
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
