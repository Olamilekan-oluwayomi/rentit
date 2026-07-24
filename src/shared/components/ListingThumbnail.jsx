import { getListingImageUrl } from "../../utils/storage";

export default function ListingThumbnail({ listing, className = "" }) {
  const imageUrl = getListingImageUrl(listing?.images?.[0]);

  return (
    <div className={`w-full sm:w-20 h-20 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0 ${className}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={listing?.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">
          No image
        </div>
      )}
    </div>
  );
}
