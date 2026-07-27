/**
 * ListingCard.jsx
 * ----------------
 * Compact card component for displaying a listing summary in grid layouts.
 * Features hover lift animation, lazy-loaded cover image, price display,
 * category pill, and location indicator. Used in ListingGrid and search results.
 */
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Badge } from "../../../design";
import { getListingImageUrl } from "../../../utils/storage";

/**
 * Modern listing card with hover lift, lazy images, and category pill.
 * The entire card is a Link to the listing detail page for click-through convenience.
 * @param {{ listing: object }} props - A listing object with id, title, daily_price, category, location, and images
 */
export default function ListingCard({ listing }) {
  // Use the first image as the cover; falls back to empty (showing placeholder).
  const imageUrl = getListingImageUrl(listing.images?.[0]);

  return (
    <Link
      to={`/listings/${listing.id}`}
      // Hover effects: subtle shadow + lift create visual depth on interaction.
      className="group bg-surface rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* ── Cover Image ──────────────────────────────────────── */}
      <div className="aspect-4/3 overflow-hidden bg-gray-100 dark:bg-white/5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            loading="lazy"
            // Slow zoom on hover adds a subtle interactive feel without being distracting.
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Placeholder icon when no image is available */
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-text-secondary/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* ── Card Content ─────────────────────────────────────── */}
      <div className="p-4">
        {/* Price — prominent accent color draws attention to cost */}
        <p className="text-lg font-heading font-bold text-accent mb-1">
          ${listing.daily_price}
          <span className="text-xs font-normal text-text-secondary font-body">
            {" "}
            / day
          </span>
        </p>

        {/* Title — line-clamp-1 prevents multi-line titles from breaking layout */}
        <h3 className="text-sm font-medium text-text-primary line-clamp-1 mb-2">
          {listing.title}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <Badge variant="accent" className="shrink-0 whitespace-nowrap">
           {listing.category}
        </Badge>
         {/* Location is optional — only shown if provided */}
        {listing.location && (
         <span className="flex items-center gap-1 text-xs text-text-secondary truncate min-w-0">
         <MapPin size={12} className="flex-shrink-0" />
         {listing.location}
          </span>
  )}
</div>
      </div>
    </Link>
  );
}
