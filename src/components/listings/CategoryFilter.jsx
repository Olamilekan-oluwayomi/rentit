import { CATEGORIES } from "../../lib/constants";

/**
 * Horizontal scrollable category filter pills.
 * @param {{ value: string, onChange: (category: string) => void }}
 */
export default function CategoryFilter({ value, onChange }) {
  const allCategories = ["All", ...CATEGORIES];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
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
