/**
 * ListingDetailPage — Full detail view for a single rental listing.
 *
 * Shows the image gallery, title, price, category, location, description,
 * and the owner's profile card. Owners see edit/delete actions; other
 * authenticated users see a "Contact Owner" button.
 *
 * Supports two delete modes:
 *   - Soft delete: hides the listing from browsing but preserves data.
 *   - Hard delete: permanently removes the listing and its images.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useListing } from "../hooks/useListing";
import { supabase } from "../lib/supabase";
import ImageGallery from "../components/listings/ImageGallery";
import OwnerCard from "../components/listings/OwnerCard";
import ConfirmDialog from "../components/listings/ConfirmDialog";
import AvailabilityCalendar from "../components/bookings/AvailabilityCalendar";

/**
 * @returns {JSX.Element} The listing detail page with gallery, info, owner card, and actions.
 */
export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { listing, loading, error, softDeleteListing, hardDeleteListing } =
    useListing(id);

  const [owner, setOwner] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [showSoftDelete, setShowSoftDelete] = useState(false);
  const [showHardDelete, setShowHardDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Derived flag used to conditionally render owner actions vs contact button.
  const isOwner = user && listing && user.id === listing.owner_id;

  // Fetch the listing owner's profile so we can display the OwnerCard sidebar.
  useEffect(() => {
    if (!listing?.owner_id) return;

    const fetchOwner = async () => {
      setOwnerLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", listing.owner_id)
        .single();
      setOwner(data);
      setOwnerLoading(false);
    };

    fetchOwner();
  }, [listing?.owner_id]);

  /** Soft-deletes the listing (marks inactive) and redirects to home. */
  const handleSoftDelete = async () => {
    setActionLoading(true);
    const result = await softDeleteListing();
    setActionLoading(false);
    setShowSoftDelete(false);

    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast("Listing removed from browsing.");
      navigate("/");
    }
  };

  /** Permanently deletes the listing and its images. Does NOT navigate away. */
  const handleHardDelete = async () => {
    setActionLoading(true);
    const result = await hardDeleteListing();
    setActionLoading(false);
    setShowHardDelete(false);

    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast("Listing permanently deleted.");
    }
  };

  // Skeleton placeholder while the listing is loading.
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="animate-pulse space-y-6">
          <div className="aspect-video bg-gray-200 dark:bg-white/5 rounded-2xl" />
          <div className="h-8 bg-gray-200 dark:bg-white/5 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/4" />
        </div>
      </div>
    );
  }

  // Error or missing listing.
  if (error || !listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <p className="text-text-secondary text-lg mb-4">
          {error || "This listing could not be found."}
        </p>
        <Link
          to="/"
          className="text-sm font-medium text-accent hover:underline"
        >
          Back to Browse
        </Link>
      </div>
    );
  }

  // ── Booking request handler (renter mode) ────────────────
  // Called when a non-owner selects a range and clicks "Request to Book".
  // Scoped to availability/calendar only — the actual booking insert
  // will be implemented in a separate feature.
  const handleRangeConfirmed = (startDate, endDate, totalPrice) => {
    addToast(
      `Booking request: ${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()} ($${totalPrice})`,
      "info"
    );
  };

  const createdDate = new Date(listing.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      {/* Image gallery */}
      <ImageGallery images={listing.images || []} />

      {/* Availability calendar — positioned below the image gallery */}
      <div className="mt-8">
        {user ? (
          <AvailabilityCalendar
            listingId={listing.id}
            dailyPrice={listing.daily_price}
            isOwner={isOwner}
            onRangeConfirmed={handleRangeConfirmed}
          />
        ) : (
          <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-6 text-center">
            <p className="text-sm text-text-secondary mb-3">
              Log in to check availability and book this listing.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
            >
              Log in to Book
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content — takes 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + Price */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                {listing.title}
              </h1>
              <p className="text-2xl font-heading font-bold text-accent flex-shrink-0">
                ${listing.daily_price}
                <span className="text-sm font-normal text-text-secondary font-body">
                  {" "}
                  / day
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent/10 text-accent">
                {listing.category}
              </span>
              {listing.location && (
                <span className="flex items-center gap-1 text-sm text-text-secondary">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  {listing.location}
                </span>
              )}
              <span className="text-xs text-text-secondary">
                Listed {createdDate}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-sm font-medium text-text-secondary mb-2">
              Description
            </h2>
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Owner actions — only shown when the current user owns this listing */}
          {isOwner && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
              <Link
                to={`/listings/${listing.id}/edit`}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
              >
                Edit Listing
              </Link>
              <button
                onClick={() => setShowSoftDelete(true)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-white/15 text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                Remove from Browse
              </button>
              <button
                onClick={() => setShowHardDelete(true)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          )}

          {/* Contact button — shown to non-owner authenticated users only */}
          {!isOwner && user && (
            <a
              href={`mailto:?subject=RentIt%20-%20${encodeURIComponent(listing.title)}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              Contact Owner
            </a>
          )}
        </div>

        {/* Sidebar — owner card with contact info */}
        <div className="space-y-6">
          <OwnerCard owner={owner} loading={ownerLoading} />
        </div>
      </div>

      {/* Soft delete confirmation dialog */}
      <ConfirmDialog
        open={showSoftDelete}
        title="Remove Listing"
        message="This listing will be hidden from browsing but can be restored later."
        confirmLabel="Remove"
        loading={actionLoading}
        onConfirm={handleSoftDelete}
        onCancel={() => setShowSoftDelete(false)}
      />

      {/* Hard delete confirmation dialog */}
      <ConfirmDialog
        open={showHardDelete}
        title="Delete Permanently"
        message="This action cannot be undone. The listing and all its images will be permanently deleted."
        confirmLabel="Delete Forever"
        danger
        loading={actionLoading}
        onConfirm={handleHardDelete}
        onCancel={() => setShowHardDelete(false)}
      />
    </div>
  );
}
