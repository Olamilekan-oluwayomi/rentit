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
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs text-text-secondary">Active:</span>
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
