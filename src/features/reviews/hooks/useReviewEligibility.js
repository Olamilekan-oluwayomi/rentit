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
