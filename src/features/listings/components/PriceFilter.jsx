/**
 * PriceFilter — Dual-input range filter for minimum/maximum daily price.
 *
 * Route: Listings page ("/listings") — used in the filter bar and mobile drawer.
 * Responsibilities: Renders two number inputs (min/max) with dollar sign prefixes
 *   separated by a dash. Calls onChange with both values on each input change.
 * Dependencies: None (pure presentational component).
 * Important notes: Uses type="number" with min=0 to prevent negative values.
 *   Both inputs are uncontrolled from the parent's perspective (parent owns state).
 */

export default function PriceFilter({ min, max, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
          $
        </span>
        <input
          type="number"
          autoComplete="off"
          min="0"
          step="1"
          value={min}
          onChange={(e) => onChange(e.target.value, max)}
          placeholder="Min"
          aria-label="Minimum daily price"
          className="w-full pl-7 pr-2 py-2.5 border border-border rounded-lg bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-fast ease"
        />
      </div>
      <span className="text-text-muted text-sm">–</span>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
          $
        </span>
        <input
          type="number"
          autoComplete="off"
          min="0"
          step="1"
          value={max}
          onChange={(e) => onChange(min, e.target.value)}
          placeholder="Max"
          aria-label="Maximum daily price"
          className="w-full pl-7 pr-2 py-2.5 border border-border rounded-lg bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-fast ease"
        />
      </div>
    </div>
  );
}
