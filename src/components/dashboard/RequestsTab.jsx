/**
 * RequestsTab — Displays pending booking requests for the owner's listings.
 *
 * Shows bookings where the related listing's owner_id is the current user
 * AND status is 'pending', with renter info, listing details, status badge,
 * and approve/decline actions.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useBookings } from "../../features/bookings/hooks/useBookings";
import { useToast } from "../../shared/contexts/ToastContext";
import { supabase } from "../../shared/lib/supabase";
import StatusBadge from "../../features/bookings/components/StatusBadge";
import ListingThumbnail from "../../shared/components/ListingThumbnail";
import RenterInfo from "../../shared/components/RenterInfo";
import BookingMeta from "../../shared/components/BookingMeta";
import BookingListSkeleton from "../../shared/components/BookingListSkeleton";
import EmptyState from "../../shared/components/EmptyState";
import AnimatedList, { AnimatedListItem } from "../../shared/components/AnimatedList";

export default function RequestsTab() {
  const { data: bookings, loading, error, refetch } = useBookings("requests");
  const { addToast } = useToast();
  const [actionId, setActionId] = useState(null);

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

  if (loading) return <BookingListSkeleton />;

  if (error) {
    return <p className="text-text-secondary text-sm py-8 text-center">{error}</p>;
  }

  if (bookings.length === 0) {
    return <EmptyState message="No pending requests." />;
  }

  return (
    <AnimatedList className="space-y-3">
      {bookings.map((booking) => {
        const listing = booking.listings;
        const renter = booking.profiles;
        const isPending = booking.status === "pending";
        const isLoading = actionId === booking.id;

        return (
          <AnimatedListItem key={booking.id}>
            <Link
              to={`/booking/${booking.id}`}
              className="block bg-surface rounded-2xl border border-border p-4 hover:border-accent/30 transition-colors"
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

              {isPending && (
                <div className="flex items-center gap-2 shrink-0 sm:self-center" onClick={(e) => e.preventDefault()}>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleApprove(booking);
                    }}
                    disabled={isLoading}
                    whileTap={{ scale: 0.97 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "..." : "Approve"}
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDecline(booking);
                    }}
                    disabled={isLoading}
                    whileTap={{ scale: 0.97 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "..." : "Decline"}
                  </motion.button>
                </div>
              )}
            </div>
            </Link>
          </AnimatedListItem>
        );
      })}
    </AnimatedList>
  );
}
