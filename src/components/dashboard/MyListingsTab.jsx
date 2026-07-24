/**
 * MyListingsTab — Displays the current owner's listings with management actions.
 *
 * Shows both active and inactive listings (owner management view).
 * Each row displays thumbnail, title, active/inactive status, view count,
 * booking request count, and edit/delete actions.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useListings } from "../../hooks/useListings";
import { useListingBookingStats } from "../../hooks/useListingBookingStats";
import { supabase } from "../../lib/supabase";
import ConfirmDialog from "../listings/ConfirmDialog";

/**
 * @returns {JSX.Element} The owner's listings management tab.
 */
export default function MyListingsTab() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const {
    listings,
    loading,
    error,
    totalCount,
    refreshListings,
  } = useListings({
    owner_id: user?.id,
    includeInactive: true,
    sort: "newest",
    page: 1,
    limit: 50,
  });

  const listingIds = listings.map((l) => l.id);
  const { stats: bookingStats } = useListingBookingStats(listingIds);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /** Permanently delete a listing and its images from storage. */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    // Remove images from storage first
    if (deleteTarget.images?.length) {
      await supabase.storage.from("listing-images").remove(deleteTarget.images);
    }

    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", deleteTarget.id);

    setDeleting(false);
    setDeleteTarget(null);

    if (deleteError) {
      addToast(deleteError.message, "error");
    } else {
      addToast("Listing deleted.");
      refreshListings();
    }
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

  if (listings.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-10 text-center space-y-3">
        <p className="text-text-secondary">You haven&apos;t created any listings yet.</p>
        <Link
          to="/listings/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Listing
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-xs text-text-secondary mb-4">{totalCount} listing{totalCount !== 1 ? "s" : ""}</p>

      <div className="space-y-3">
        {listings.map((listing) => {
          const firstImage = listing.images?.[0] || null;

          return (
            <div
              key={listing.id}
              className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex flex-col sm:flex-row gap-4"
            >
              {/* Thumbnail */}
              <div className="w-full sm:w-20 h-20 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0">
                {firstImage ? (
                  <img src={firstImage} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">No image</div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-heading font-semibold text-text-primary truncate">{listing.title}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                      listing.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
                    }`}
                  >
                    {listing.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                  <span>${listing.daily_price}/day</span>
                  <span>{listing.view_count ?? 0} views</span>
                  <span>{bookingStats[listing.id] ?? 0} requests</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 sm:self-center">
                <Link
                  to={`/listings/${listing.id}/edit`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-white/15 text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteTarget(listing)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Listing"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
