/**
 * BookingListSkeleton — Loading placeholder for booking/listings lists.
 *
 * Renders a configurable number of skeleton bars matching the rounded-card
 * layout of booking/listings list items.
 *
 * @param {{ count?: number }} props - Number of skeleton items (default 3).
 */

import { Skeleton } from "../../design";

export default function BookingListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
  );
}
