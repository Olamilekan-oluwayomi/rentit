/**
 * ListingSkeleton.jsx
 * --------------------
 * Placeholder loading skeleton for listing cards. Mimics the exact layout
 * of ListingCard (image area + price + title + category pills) so the
 * transition from skeleton to real content feels seamless and avoids layout shift.
 * Uses CSS `animate-pulse` for the shimmer effect.
 */

/**
 * Renders a configurable number of skeleton listing cards in the same grid
 * layout as the actual listing grid. Used during data fetching to maintain
 * visual structure and prevent content jump.
 * @param {{ count: number }} props - Number of skeleton cards to render (default: 8)
 */
export default function ListingSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          // animate-pulse creates the shimmer/pulse effect across all skeleton blocks
          className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-pulse"
        >
          {/* Image placeholder — matches the 4:3 aspect ratio of real cards */}
          <div className="aspect-4/3 bg-gray-200 dark:bg-white/5" />
          {/* Text placeholders — widths vary to mimic real text lengths */}
          <div className="p-4 space-y-3">
            {/* Title bar — 75% width simulates a typical title length */}
            <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-3/4" />
            {/* Subtitle bar — 50% width for secondary text */}
            <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-1/2" />
            {/* Category/location pills — two small rounded shapes */}
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 dark:bg-white/5 rounded-full w-16" />
              <div className="h-5 bg-gray-200 dark:bg-white/5 rounded-full w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
