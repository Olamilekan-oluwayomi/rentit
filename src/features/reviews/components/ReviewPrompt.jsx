import { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { useReviewEligibility } from "../hooks/useReviewEligibility";
import { StarRatingInput, Button } from "../../../design";
import ReviewForm from "./ReviewForm";

export default function ReviewPrompt({ booking, revieweeId, onReviewUpdate }) {
  const { user } = useAuth();
  const { eligibility, existingReview, loading } = useReviewEligibility({
    booking,
    reviewerId: user?.id,
  });
  const [showForm, setShowForm] = useState(false);

  if (loading || !eligibility.eligible) return null;

  if (showForm) {
    return (
      <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.preventDefault()}>
        <ReviewForm
          bookingId={booking.id}
          reviewerId={user.id}
          revieweeId={revieweeId}
          existingReview={existingReview}
          onSuccess={(review) => {
            setShowForm(false);
            onReviewUpdate?.(review);
          }}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  if (eligibility.canEdit && existingReview) {
    return (
      <div className="mt-3 pt-3 border-t border-border space-y-2" onClick={(e) => e.preventDefault()}>
        <div className="flex items-center gap-2">
          <StarRatingInput value={existingReview.rating} readOnly size="sm" />
          <span className="text-xs text-text-muted">Your review</span>
        </div>
        {existingReview.comment && (
          <p className="text-sm text-text-secondary">{existingReview.comment}</p>
        )}
        <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
          Edit review
        </Button>
      </div>
    );
  }

  if (eligibility.canLeave) {
    return (
      <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.preventDefault()}>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          Leave a review
        </Button>
      </div>
    );
  }

  return null;
}
