/**
 * ActiveFilters — Displays currently applied filters as removable chips with a "Clear All" button.
 *
 * Route: Listings page ("/listings") — used in the filter bar.
 * Responsibilities: Lists all non-empty filter values (search, category, location, price range)
 *   as dismissible Chip components. Calls onRemove to remove a single filter or onClear to reset all.
 * Dependencies: design/Chip, design/Button.
 * Important notes: Returns null when no filters are active. Each chip key maps to a filter field name
 *   that the parent uses to clear that specific filter.
 */

import { Chip } from "../../../design";
import { Button } from "../../../design";

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
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <span className="text-xs text-text-muted font-medium">Active:</span>
      {chips.map((chip) => (
        <Chip key={chip.key} onRemove={() => onRemove(chip.key)}>
          {chip.label}
        </Chip>
      ))}
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear All
      </Button>
    </div>
  );
}
