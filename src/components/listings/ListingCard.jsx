import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getListingImageUrl } from "../../utils/storage";

/**
 * Modern listing card with hover lift, lazy images, and category pill.
 * @param {{ listing: object }}
 */
export default function ListingCard({ listing }) {
  const imageUrl = getListingImageUrl(listing.images?.[0]);

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group bg-surface rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-4/3 overflow-hidden bg-gray-100 dark:bg-white/5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
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

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <p className="text-lg font-heading font-bold text-accent mb-1">
          ${listing.daily_price}
          <span className="text-xs font-normal text-text-secondary font-body">
            {" "}
            / day
          </span>
        </p>

        {/* Title */}
        <h3 className="text-sm font-medium text-text-primary line-clamp-1 mb-2">
          {listing.title}
        </h3>

        {/* Category pill + location */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
            {listing.category}
          </span>
          {listing.location && (
            <span className="flex items-center gap-1 text-xs text-text-secondary truncate">
              <MapPin size={12} className="flex-shrink-0" />
              {listing.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
