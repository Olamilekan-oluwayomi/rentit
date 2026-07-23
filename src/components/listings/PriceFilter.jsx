/**
 * PriceFilter — Dual input for minimum and maximum daily price.
 *
 * Two number inputs side-by-side on desktop, stacked on mobile.
 * Values are string-based so empty inputs don't coerce to 0.
 * The parent debounces before passing to useListings.
 */

/**
 * @param {{ min: string, max: string, onChange: (min: string, max: string) => void }} props
 */
export default function PriceFilter({ min, max, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">
          $
        </span>
        <input
          type="number"
          min="0"
          step="1"
          value={min}
          onChange={(e) => onChange(e.target.value, max)}
          placeholder="Min"
          aria-label="Minimum daily price"
          className="w-full pl-7 pr-2 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <span className="text-text-secondary text-xs">–</span>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">
          $
        </span>
        <input
          type="number"
          min="0"
          step="1"
          value={max}
          onChange={(e) => onChange(min, e.target.value)}
          placeholder="Max"
          aria-label="Maximum daily price"
          className="w-full pl-7 pr-2 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
    </div>
  );
}
