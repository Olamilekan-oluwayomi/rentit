/*
|--------------------------------------------------------------------------
| useCreateBooking.js
|--------------------------------------------------------------------------
|
| Handles the full booking request flow for a renter.
|
| Purpose: Re-validates availability at submission time before inserting booking.
| Inputs: (via createBooking) listingId, startDate, endDate, totalPrice
| Outputs: { createBooking, submitting }
| Side effects: Supabase queries/inserts; race-condition defense
|
|--------------------------------------------------------------------------
*/

/*
 * RACE-CONDITION DEFENSE:
 * Between the moment a renter views the calendar and the moment they click
 * "Request to Book", another booking may have been approved (which inserts a
 * new blocked range into the availability table). Without this re-check the
 * renter could submit a booking for dates that are now unavailable.
 * By re-fetching availability at submission time we ensure the insert only
 * proceeds if the dates are still clear.
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, eachDayOfInterval } from "date-fns";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import { useToast } from "../../../shared/contexts/ToastContext";
import { useRequireCompleteProfile } from "../../profile/hooks/useRequireCompleteProfile";
import { useProfileContext } from "../../profile/context/ProfileContext";

/**
 * @returns {{
 *   createBooking: (listingId: string, startDate: Date, endDate: Date, totalPrice: number) => Promise<{success?: boolean, booking?: object, error?: string}>,
 *   submitting: boolean
 * }}
 */
export function useCreateBooking() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { requireProfile } = useRequireCompleteProfile();
  const { isProfileComplete } = useProfileContext();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  /**
   * Validates the range against live availability and, if clear, inserts
   * a new booking row with status 'pending'.
   *
   * @param {string} listingId - UUID of the listing to book
   * @param {Date}   startDate - First day of the requested range
   * @param {Date}   endDate   - Last day of the requested range
   * @param {number} totalPrice - Calculated total (daily_price × nights)
   * @returns {Promise<{success?: boolean, booking?: object, error?: string}>}
   */
  const createBooking = useCallback(
    async (listingId, startDate, endDate, totalPrice) => {
      if (!user) {
        addToast("You must be logged in to book.", "error");
        return { error: "Not authenticated" };
      }

      setSubmitting(true);

      // ── Race-condition re-validation ───────────────────────
      // Re-fetch the latest blocked ranges for this listing right before
      // inserting. This closes the window where another approved booking
      // could have blocked dates after the calendar was first loaded.
      const { data: liveRanges, error: rangeError } = await supabase
        .from("availability")
        .select("*")
        .eq("listing_id", listingId)
        .eq("is_blocked", true)
        .order("start_date", { ascending: true });

      if (rangeError) {
        setSubmitting(false);
        addToast("Failed to verify availability. Please try again.", "error");
        return { error: rangeError.message };
      }

      // Enumerate every calendar day in the proposed range and check
      // each one against the freshly-fetched blocked ranges.
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const hasOverlap = days.some((day) => {
        const ts = day.getTime();
        return (liveRanges ?? []).some((r) => {
          const start = new Date(r.start_date).getTime();
          const end = new Date(r.end_date).getTime();
          return ts >= start && ts <= end;
        });
      });

      if (hasOverlap) {
        setSubmitting(false);
        addToast(
          "Those dates are no longer available. Another booking may have been approved. Please choose different dates.",
          "error"
        );
        return { error: "Date range overlaps a blocked range" };
      }

      // ── Insert the booking ─────────────────────────────────
      const { data: booking, error: insertError } = await supabase
        .from("bookings")
        .insert({
          listing_id: listingId,
          renter_id: user.id,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          total_price: totalPrice,
          status: "pending",
        })
        .select()
        .single();

      setSubmitting(false);

      if (insertError) {
        addToast(insertError.message, "error");
        return { error: insertError.message };
      }

      return { success: true, booking };
    },
    [user, addToast]
  );

  const createBookingGated = useCallback(
    (listingId, startDate, endDate, totalPrice) => {
      if (!user) {
        navigate(`/login?redirect=/listings/${listingId}`);
        return Promise.resolve({ error: "Not authenticated" });
      }
      if (!isProfileComplete) {
        addToast(
          "Please complete your profile (photo and location) before booking.",
          "info",
        );
      }
      return new Promise((resolve) => {
        requireProfile(() => {
          createBooking(listingId, startDate, endDate, totalPrice)
            .then(resolve)
            .catch(() => resolve({ error: "Booking failed unexpectedly." }));
        });
      });
    },
    [user, requireProfile, createBooking, navigate, isProfileComplete, addToast],
  );

  return { createBooking: createBookingGated, submitting };
}
