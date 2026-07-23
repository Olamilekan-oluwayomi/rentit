import { Link } from "react-router-dom";

export default function ListingCard({ listing }) {
  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : null;

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="bg-surface rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-heading font-semibold text-text-primary truncate">
            {listing.title}
          </h3>
          <span className="text-accent font-bold whitespace-nowrap">
            ${listing.daily_price}
            <span className="text-xs font-normal text-text-secondary">/day</span>
          </span>
        </div>

        <p className="text-sm text-text-secondary truncate mb-2">
          {listing.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="bg-gray-100 px-2 py-0.5 rounded-full">
            {listing.category}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.location}
          </span>
        </div>
      </div>
    </Link>
  );
}
