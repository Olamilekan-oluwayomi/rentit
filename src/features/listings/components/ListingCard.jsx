import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import { Badge, Avatar } from "../../../design";
import { getListingImageUrl, getAvatarUrl } from "../../../utils/storage";

export default function ListingCard({ listing }) {
  const imageUrl = getListingImageUrl(listing.images?.[0]);
  const ownerAvatar = listing.owner?.avatar_url ? getAvatarUrl(listing.owner.avatar_url) : null;
  const ownerName = listing.owner?.full_name || "Owner";

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group block bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-[3px] transition-all duration-normal"
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md text-text-secondary hover:text-accent hover:bg-white transition-all duration-fast active:scale-90"
          aria-label="Add to wishlist"
        >
          <Heart size={16} />
        </button>

       <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
       <Badge variant="sage-filled" className="max-w-[65%] truncate whitespace-nowrap">
        {listing.category}
       </Badge>
       <Badge variant="success-filled" className="shrink-0 whitespace-nowrap">
        Available
       </Badge>
       </div>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-heading font-semibold text-text-primary line-clamp-1 mb-2">
          {listing.title}
        </h3>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-lg font-mono font-bold text-text-primary">
            ${listing.daily_price}
          </span>
          <span className="text-xs text-text-muted font-body">/ day</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar src={ownerAvatar} name={ownerName} size="sm" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-text-secondary truncate">{ownerName}</span>
              {listing.location && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <MapPin size={10} />
                  <span className="truncate">{listing.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
