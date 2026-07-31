/*
|--------------------------------------------------------------------------
| ListingDetailPage.jsx
|--------------------------------------------------------------------------
|
| Full listing detail view with image gallery, description, owner info,
| booking calendar, reviews, and related listings. Owners see edit/delete
| actions; non-owners see booking controls and contact owner button.
| Uses sticky desktop booking card and mobile booking bar/panel.
|
| Route: /listings/:id
| Responsibilities: Display listing details, handle booking flow, soft/hard delete
| Dependencies: useListing, useCreateBooking, useContactOwner, supabase,
|               ListingGallery, OwnerCard, AvailabilityCalendar, ReviewsSection
| Notes: Soft delete hides listing from browse; hard delete removes permanently.
|        Related listings fetched directly via supabase by category.
|
|--------------------------------------------------------------------------
*/

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, ChevronLeft, Heart } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useToast } from "../../../shared/contexts/ToastContext";
import { useListing } from "../hooks/useListing";
import { useFavorites } from "../../favorites/hooks/useFavorites";
import { useCreateBooking } from "../../bookings/hooks/useCreateBooking";
import { useContactOwner } from "../../messages/hooks/useContactOwner";
import { supabase } from "../../../shared/lib/supabase";
import { getListingImageUrl } from "../../../utils/storage";
import { Button, EmptyState, Badge, StarRatingInput } from "../../../design";
import ReviewsSection from "../../reviews/components/ReviewsSection";
import ListingGallery from "./ListingGallery";
import OwnerCard from "./OwnerCard";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import AvailabilityCalendar from "../../bookings/components/AvailabilityCalendar";
import FadeInSection from "../../../shared/components/FadeInSection";

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { listing, loading, error, softDeleteListing, restoreListing, hardDeleteListing } = useListing(id);
  const { createBooking } = useCreateBooking();
  const { isFavorited, toggleFavorite } = useFavorites();

  const [showSoftDelete, setShowSoftDelete] = useState(false);
  const [showHardDelete, setShowHardDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [showMobileBooking, setShowMobileBooking] = useState(false);

  const isOwner = user && listing && user.id === listing.owner_id;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-[300px] lg:h-[500px] bg-surface-tertiary/60 rounded-2xl" />
          <div className="h-8 bg-surface-tertiary/60 rounded w-1/3" />
          <div className="h-4 bg-surface-tertiary/60 rounded w-1/4" />
          <div className="h-20 bg-surface-tertiary/60 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <EmptyState
          title="Not found"
          description={error || "This listing could not be found."}
          action={
            <Link to="/">
              <Button variant="outline">Back to Browse</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleRangeConfirmed = async (startDate, endDate, totalPrice) => {
    const result = await createBooking(listing.id, startDate, endDate, totalPrice);

    if (result?.success) {
      setBookingResult({ startDate, endDate, totalPrice, listingTitle: listing.title });
      setShowMobileBooking(false);
    } else if (!result?.error) {
      addToast("Your profile needs to be completed before booking.", "info");
    }
  };

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

  const handleRestore = async () => {
    setActionLoading(true);
    const result = await restoreListing();
    setActionLoading(false);

    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast("Listing restored to browse.");
    }
  };

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

  const createdDate = new Date(listing.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bookingCard = (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-mono font-bold text-text-primary">
          ${listing.daily_price}
        </span>
        <span className="text-sm text-text-muted font-body">/ day</span>
      </div>

      {user && !isOwner && (
        <AvailabilityCalendar
          listingId={listing.id}
          dailyPrice={listing.daily_price}
          isOwner={false}
          onRangeConfirmed={handleRangeConfirmed}
        />
      )}

      {user && isOwner && (
        <AvailabilityCalendar
          listingId={listing.id}
          dailyPrice={listing.daily_price}
          isOwner={true}
          onRangeConfirmed={handleRangeConfirmed}
        />
      )}

      {!user && (
        <div className="space-y-4 pt-4 border-t border-border">
          <p className="text-sm text-text-secondary text-center">
            Log in to check availability and book this listing.
          </p>
          <Link to="/login" className="block">
            <Button fullWidth>Log in to Book</Button>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      <Link
        to="/"
        className="hidden lg:inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded active:scale-[0.97]"
      >
        <ChevronLeft size={16} />
        Back to browse
      </Link>

      <ListingGallery images={listing.images || []} />

      <div className="mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Badge variant="sage" className="mb-3">{listing.category}</Badge>
            <div className="flex items-start gap-3">
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-text-primary leading-tight flex-1">
                {listing.title}
              </h1>
              {user && !isOwner && (
                <button
                  onClick={() => toggleFavorite(listing.id)}
                  className={`shrink-0 mt-1 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-fast active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                    isFavorited(listing.id)
                      ? "bg-danger/10 text-danger hover:bg-danger/20"
                      : "bg-surface-secondary text-text-secondary hover:text-danger hover:bg-danger/5"
                  }`}
                  aria-label={isFavorited(listing.id) ? "Remove from saved" : "Save listing"}
                >
                  <Heart size={20} fill={isFavorited(listing.id) ? "currentColor" : "none"} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {listing.location && (
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <MapPin size={15} />
                  {listing.location}
                </span>
              )}
              <span className="text-sm text-text-muted">Listed {createdDate}</span>
            </div>
          </div>

          <div className="lg:hidden">{bookingCard}</div>

          <FadeInSection>
            <div>
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-6">
                Description
              </h2>
              <div className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="pt-2">
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-6">
                Hosted by
              </h2>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-lg font-heading font-semibold text-text-primary">
                {listing.owner?.full_name || "Anonymous"}
              </p>
              {listing.owner?.rating_count > 0 ? (
                <div className="flex items-center gap-1.5">
                  <StarRatingInput value={listing.owner.average_rating} readOnly size="sm" />
                  <span className="text-sm text-text-muted">
                    ({listing.owner.rating_count})
                  </span>
                </div>
              ) : (
                <span className="text-sm text-text-muted">No reviews yet</span>
              )}
            </div>
            <OwnerCard owner={listing.owner} loading={false} listingId={listing.id} />
          </div>
          </FadeInSection>

          {isOwner && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <Link to={`/listings/${listing.id}/edit`}>
                <Button>Edit Listing</Button>
              </Link>
              {listing.is_active ? (
                <Button variant="outline" onClick={() => setShowSoftDelete(true)}>
                  Remove from Browse
                </Button>
              ) : (
                <Button
                  variant="outline"
                  loading={actionLoading}
                  onClick={handleRestore}
                >
                  Restore to Browse
                </Button>
              )}
              <Button variant="danger" onClick={() => setShowHardDelete(true)}>
                Delete Permanently
              </Button>
            </div>
          )}

          {!isOwner && user && (
            <div className="lg:hidden">
              <ContactOwnerButton listingId={listing.id} />
            </div>
          )}

          <FadeInSection>
            <ReviewsSection
              ownerId={listing.owner_id}
              ratingCount={listing.owner?.rating_count || 0}
            />
          </FadeInSection>

          <FadeInSection>
            <RelatedListings category={listing.category} excludeId={listing.id} />
          </FadeInSection>
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">{bookingCard}</div>
        </div>
      </div>

      {!!user && (
        <MobileBookingBar
          visible={!isOwner && !showMobileBooking}
          price={listing.daily_price}
          onOpen={() => setShowMobileBooking(true)}
        />
      )}

      {!!user && (
        <MobileBookingPanel
          open={showMobileBooking}
          onClose={() => setShowMobileBooking(false)}
          price={listing.daily_price}
          listingId={listing.id}
          isOwner={isOwner}
          onRangeConfirmed={handleRangeConfirmed}
        />
      )}

      {bookingResult && (
        <BookingConfirmationModal
          bookingResult={bookingResult}
          onClose={() => setBookingResult(null)}
        />
      )}

      <ConfirmDialog
        open={showSoftDelete}
        title="Remove Listing"
        message="This listing will be hidden from browsing but can be restored later."
        confirmLabel="Remove"
        loading={actionLoading}
        onConfirm={handleSoftDelete}
        onCancel={() => setShowSoftDelete(false)}
      />

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

function ContactOwnerButton({ listingId }) {
  const { contactOwner, loading } = useContactOwner();

  return (
    <Button
      variant="outline"
      fullWidth
      onClick={() => contactOwner(listingId)}
      loading={loading}
      disabled={loading}
    >
      {loading ? "Opening chat..." : "Contact Owner"}
    </Button>
  );
}

function RelatedListings({ category, excludeId }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    const fetchRelated = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("listings")
        .select("*, owner:owner_id(id, full_name, avatar_url)")
        .eq("is_active", true)
        .eq("category", category)
        .neq("id", excludeId)
        .order("created_at", { ascending: false })
        .limit(6);
      setListings(data || []);
      setLoading(false);
    };

    fetchRelated();
  }, [category, excludeId]);

  if (!loading && listings.length === 0) return null;

  return (
    <div className="pt-6 border-t border-border">
      <h2 className="text-xl font-heading font-bold text-text-primary mb-6">
        More in {category}
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-4/3 bg-surface-tertiary/40" />
              <div className="p-3 space-y-2.5">
                <div className="h-4 bg-surface-tertiary/60 rounded w-4/5" />
                <div className="h-5 bg-surface-tertiary/60 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="gap-5 lg:gap-6"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
        >
          {listings.slice(0, 6).map((item) => (
            <RelatedListingCard key={item.id} listing={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedListingCard({ listing }) {
  const imageUrl = getListingImageUrl(listing.images?.[0], { width: 320, height: 320 });

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group block bg-surface rounded-2xl border border-border overflow-hidden hover:border-accent/30 hover:-translate-y-[2px] active:scale-[0.99] transition-all duration-normal"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-surface-tertiary/40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <Badge variant="sage-filled" className="text-[11px] px-2 py-0.5">{listing.category}</Badge>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-heading font-semibold text-text-primary line-clamp-1 mb-1">
          {listing.title}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-mono font-bold text-text-primary">
            ${listing.daily_price}
          </span>
          <span className="text-xs text-text-muted">/ day</span>
        </div>
      </div>
    </Link>
  );
}

function MobileBookingBar({ visible, price, onOpen }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border p-4 flex items-center justify-between lg:hidden">
      <div>
        <span className="text-lg font-mono font-bold text-text-primary">${price}</span>
        <span className="text-sm text-text-muted font-body"> / day</span>
      </div>
      <Button onClick={onOpen}>Request to Book</Button>
    </div>
  );
}

function MobileBookingPanel({ open, onClose, price, listingId, isOwner, onRangeConfirmed }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="Book this listing">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative w-full bg-surface rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-surface z-10 flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-heading font-semibold text-text-primary">Book this listing</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-baseline gap-1.5 mb-5">
            <span className="text-2xl font-mono font-bold text-text-primary">${price}</span>
            <span className="text-sm text-text-muted font-body">/ day</span>
          </div>
          <AvailabilityCalendar
            listingId={listingId}
            dailyPrice={price}
            isOwner={isOwner}
            onRangeConfirmed={onRangeConfirmed}
          />
        </div>
      </div>
    </div>
  );
}

function BookingConfirmationModal({ bookingResult, onClose }) {
  if (!bookingResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Booking submitted">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scale-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Booking Request Submitted
            </h3>
            <p className="text-sm text-text-secondary">
              Your request is pending owner approval.
            </p>
          </div>
        </div>

        <div className="bg-surface-secondary rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Listing</span>
            <span className="text-text-primary font-medium">{bookingResult.listingTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Dates</span>
            <span className="text-text-primary font-medium">
              {format(bookingResult.startDate, "MMM d, yyyy")} –{" "}
              {format(bookingResult.endDate, "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Total</span>
            <span className="text-lg font-mono font-bold text-text-primary">
              ${bookingResult.totalPrice}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Book More Dates
          </Button>
          <Link to="/dashboard">
            <Button>View My Bookings</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
