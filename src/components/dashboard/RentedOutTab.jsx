/**
 * RentedOutTab — Displays approved/completed bookings for the owner's listings.
 *
 * Shows bookings where the current user owns the related listing and the
 * booking status is 'approved' or 'completed' — things currently or
 * previously rented out to someone else. Read-only view with no actions.
 */

import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useBookings } from "../../hooks/useBookings";
import { getListingImageUrl } from "../../utils/storage";
import StatusBadge from "../bookings/StatusBadge";

/**
 * @returns {JSX.Element} The owner's rented-out bookings tab.
 */
export default function RentedOutTab() {
  const { data: bookings, loading, error } = useBookings("rented-out");

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

  if (bookings.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-10 text-center">
        <p className="text-text-secondary">You haven't rented anything out yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const listing = booking.listings;
        const renter = booking.profiles;
        const firstImage = getListingImageUrl(listing?.images?.[0]);

        return (
          <Link
            key={booking.id}
            to={`/booking/${booking.id}`}
            className="block bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Thumbnail */}
              <div className="w-full sm:w-20 h-20 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0">
                {firstImage ? (
                  <img src={firstImage} alt={listing?.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">No image</div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-heading font-semibold text-text-primary truncate">{listing?.title}</h3>
                    {renter && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden shrink-0">
                          {renter.avatar_url ? (
                            <img src={renter.avatar_url} alt={renter.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-text-secondary">
                              {renter.full_name?.[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-text-secondary">{renter.full_name}</span>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                  <span>
                    {format(parseISO(booking.start_date), "MMM d")} – {format(parseISO(booking.end_date), "MMM d, yyyy")}
                  </span>
                  <span className="font-medium text-text-primary">${booking.total_price}</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
