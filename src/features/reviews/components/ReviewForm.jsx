/**
 * ReviewForm — Form for creating or editing a review for a completed booking.
 *
 * Route: Used inside booking detail views and ReviewPrompt.
 * Responsibilities: Handles both create and update operations on the reviews table.
 *   Validates that rating >= 1 before submission. Maps database constraint errors
 *   to user-friendly messages. Calls onSuccess with the returned review data.
 * Dependencies: design/StarRatingInput + Button, supabase client.
 * Important notes: Supports both insert (new review) and update (existing review) modes
 *   based on whether existingReview prop is provided. The submit button text and behavior
 *   changes accordingly. onCancel is optional (hidden when not provided).
 */

import { useState } from "react";
import { StarRatingInput, Button } from "../../../design";
import { supabase } from "../../../shared/lib/supabase";

export default function ReviewForm({
  bookingId,
  reviewerId,
  revieweeId,
  existingReview,
  onSuccess,
  onCancel,
}) {
  // ── State ────────────────────────────────────────────────────────────
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── Event Handlers ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) return;

    setSubmitting(true);
    setError("");

    const payload = {
      booking_id: bookingId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating,
      comment: comment.trim() || null,
    };

    let result;
    if (existingReview) {
      result = await supabase
        .from("reviews")
        .update(payload)
        .eq("id", existingReview.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("reviews")
        .insert(payload)
        .select()
        .single();
    }

    setSubmitting(false);

    if (result.error) {
      const msg = result.error.message;
      if (msg.includes("booking must be approved")) {
        setError("This booking hasn't been approved yet.");
      } else if (msg.includes("booking has not ended")) {
        setError("This booking hasn't ended yet. Reviews are only available after the rental period ends.");
      } else if (msg.includes("already exists")) {
        setError("You've already submitted a review for this booking.");
      } else {
        setError(msg);
      }
      return;
    }

    onSuccess?.(result.data);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Your rating
        </label>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          readOnly={false}
        />
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-text-primary mb-1">
          Comment (optional)
        </label>
        <textarea
          id="review-comment"
          autoComplete="off"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
          className="w-full bg-surface border border-border text-text-primary placeholder:text-text-muted rounded-md px-4 py-2.5 text-sm transition-all duration-fast ease focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-y min-h-[80px]"
          aria-label="Review comment"
        />
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={rating < 1} loading={submitting}>
          {submitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <div aria-live="polite" className="sr-only">
        {submitting && "Submitting your review..."}
      </div>
    </form>
  );
}
