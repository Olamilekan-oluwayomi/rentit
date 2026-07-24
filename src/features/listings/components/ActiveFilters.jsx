/**
 * ActiveFilters — Displays active filter chips and a "Clear All" button.
 *
 * Shown only when at least one non-default filter is active.
 * Each chip can be dismissed individually, or all can be cleared at once.
 */

import { X } from "lucide-react";

/**
 * @param {{
 *   filters: object,
 *   onClear: () => void,
 *   onRemove: (key: string) => void
 * }} props
 */
export default function ActiveFilters({ filters, onClear, onRemove }) {
  const chips = [];

  if (filters.search) {
    chips.push({ key: "search", label: `Search: "${filters.search}"` });
  }
  if (filters.category && filters.category !== "All") {
    chips.push({ key: "category", label: filters.category });
  }
  if (filters.location) {
    chips.push({ key: "location", label: `Location: ${filters.location}` });
  }
  if (filters.minPrice) {
    chips.push({ key: "minPrice", label: `Min: $${filters.minPrice}` });
  }
  if (filters.maxPrice) {
    chips.push({ key: "maxPrice", label: `Max: $${filters.maxPrice}` });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs text-text-secondary">Active:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          aria-label={`Remove ${chip.label} filter`}
        >
          {chip.label}
          <X size={12} />
        </button>
      ))}
      <button
        onClick={onClear}
        className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors ml-1"
      >
        Clear All
      </button>
    </div>
  );
}
