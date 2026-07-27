import { CATEGORIES } from "../../../shared/lib/constants";
import { Chip } from "../../../design";

export default function CategoryFilter({ value, onChange }) {
  const allCategories = ["All", ...CATEGORIES];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => (
        <Chip
          key={cat}
          selected={value === cat}
          onClick={() => onChange(cat)}
        >
          {cat}
        </Chip>
      ))}
    </div>
  );
}
