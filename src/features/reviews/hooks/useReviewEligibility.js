/*
|--------------------------------------------------------------------------
| useReviewEligibility.js
|--------------------------------------------------------------------------
|
| Checks whether the current user can leave or edit a review for a booking.
|
| Purpose: Determines eligibility based on booking status (approved/completed) and end date.
| Inputs: { booking, reviewerId }
| Outputs: { eligibility ({ eligible, canLeave, canEdit, reason }), existingReview, loading, refetch }
| Side effects: Supabase query to check for existing review
|
|--------------------------------------------------------------------------
*/

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { supabase } from "../../../shared/lib/supabase";

export function useReviewEligibility({ booking, reviewerId }) {
  const { user } = useAuth();
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState({
    eligible: false,
    canLeave: false,
    canEdit: false,
    reason: "",
  });

  // Reviews are only allowed after the rental period has ended and the
  // booking was approved — prevents spam/revenge reviews before service is rendered.
  const checkEligibility = useCallback(async () => {
    if (!booking || !user) {
      setEligibility({ eligible: false, canLeave: false, canEdit: false, reason: "" });
      setExistingReview(null);
      return;
    }

    const now = new Date();
    const endDate = new Date(booking.end_date);
    const isApproved = booking.status === "approved" || booking.status === "completed";
    const hasEnded = endDate < now;

    if (!isApproved || !hasEnded) {
      setEligibility({ eligible: false, canLeave: false, canEdit: false, reason: "" });
      setExistingReview(null);
      return;
    }

    setLoading(true);

    // Check if the user already left a review — if so they can edit, not re-leave
    const { data: reviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("booking_id", booking.id)
      .eq("reviewer_id", user.id)
      .limit(1);

    const review = reviews?.[0] || null;
    setExistingReview(review);

    setEligibility({
      eligible: true,
      canLeave: !review,
      canEdit: !!review,
      reason: "",
    });

    setLoading(false);
  }, [booking, user]);

  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  return { eligibility, existingReview, loading, refetch: checkEligibility };
}
