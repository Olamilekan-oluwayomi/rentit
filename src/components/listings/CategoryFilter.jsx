/**
 * CategoryFilter.jsx
 * -------------------
 * Horizontal filter bar with selectable category pills.
 * Includes an "All" option for clearing the filter. Uses pill-style buttons
 * with accent color highlighting for the active selection. Renders as a
 * flex-wrap container so pills flow naturally on smaller screens.
 */
import { CATEGORIES } from "../../lib/constants";

/**
 * Horizontal scrollable category filter pills.
 * The "All" option is always first and represents no category filtering.
 * Parent component manages the selected state externally.
 * @param {{ value: string, onChange: (category: string) => void }} props - Current filter value and change handler
 */
export default function CategoryFilter({ value, onChange }) {
  // Prepend "All" to the constant categories list.
  // "All" maps to no filter (shows every listing regardless of category).
  const allCategories = ["All", ...CATEGORIES];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          // Active pill gets accent background + white text for clear visual distinction.
          // Inactive pills use a subtle background that darkens slightly on hover.
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            value === cat
              ? "bg-accent text-white shadow-sm"
              : "bg-gray-100 dark:bg-white/5 text-text-secondary hover:bg-gray-200 dark:hover:bg-white/10 hover:text-text-primary"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
