/**
 * LocationFilter — Text input for filtering listings by location.
 *
 * Uses ilike on the server for case-insensitive partial matching.
 * The parent debounces before passing to useListings.
 */

/**
 * @param {{ value: string, onChange: (value: string) => void }} props
 */
export default function LocationFilter({ value, onChange }) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter by location..."
        aria-label="Filter by location"
        className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}
