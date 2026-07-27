/**
 * ReviewsSection — Paginated list of reviews for a listing owner with infinite scroll.
 *
 * Route: Listing detail page ("/listings/:id") — below the main content.
 * Responsibilities: Fetches reviews from Supabase with reviewer profile join.
 *   Supports paginated loading with "Load more" button. Renders each review with
 *   avatar, name, star rating, comment, and relative timestamp (timeAgo).
 *   Handles loading, empty (no reviews), and error states.
 * Dependencies: supabase client, design/StarRatingInput + Avatar, storage/getAvatarUrl.
 * Important notes: Resets reviews and re-fetches when ownerId changes (e.g., navigating
 *   between listings). Uses range-based pagination with PAGE_SIZE = 5.
 *   timeAgo converts timestamps to relative strings (e.g., "3d ago", "2mo ago").
 */

import { useState, useEffect, useCallback } from "react";
import { StarRatingInput, Avatar } from "../../../design";
import { getAvatarUrl } from "../../../utils/storage";
import { supabase } from "../../../shared/lib/supabase";

const PAGE_SIZE = 5;

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export default function ReviewsSection({ ownerId, ratingCount }) {
  // ── State ────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // ── Data Fetching ────────────────────────────────────────────────────
  const fetchReviews = useCallback(async (pageNum) => {
    setLoading(true);

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("reviews")
      .select(`*, reviewer:reviewer_id(full_name, avatar_url)`)
      .eq("reviewee_id", ownerId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      if (pageNum === 0) {
        setReviews(data);
      } else {
        setReviews((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    }

    setLoading(false);
  }, [ownerId]);

  // ── Effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (ownerId) {
      setPage(0);
      setReviews([]);
      fetchReviews(0);
    }
  }, [ownerId, fetchReviews]);

  // ── Event Handlers ────────────────────────────────────────────────────
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (ratingCount === 0) {
    return (
      <div>
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-6">
          Reviews
        </h2>
        <p className="text-sm text-text-muted">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-6">
        Reviews ({ratingCount})
      </h2>

      <div className="space-y-5">
        {reviews.map((review) => {
          const reviewer = review.reviewer;
          const avatarSrc = reviewer?.avatar_url ? getAvatarUrl(reviewer.avatar_url, { width: 32, height: 32 }) : null;

          return (
            <div key={review.id} className="flex gap-3">
              <Avatar
                src={avatarSrc}
                name={reviewer?.full_name}
                size="sm"
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {reviewer?.full_name || "Anonymous"}
                  </span>
                  <span className="text-xs text-text-muted shrink-0">
                    {timeAgo(review.created_at)}
                  </span>
                </div>
                <StarRatingInput value={review.rating} readOnly size="sm" className="mb-1.5" />
                {review.comment && (
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="mt-6 text-sm font-medium text-accent hover:text-accent-hover transition-colors disabled:opacity-40"
        >
          {loading ? "Loading..." : "Load more reviews"}
        </button>
      )}
    </div>
  );
}
