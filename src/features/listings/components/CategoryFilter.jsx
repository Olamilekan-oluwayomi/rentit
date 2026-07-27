/**
 * CategoryFilter — Horizontal row of category chips with icons for filtering listings.
 *
 * Route: Listings page ("/listings") — used in the filter bar.
 * Responsibilities: Renders a Chip for each predefined category plus "All".
 *   Highlights the currently selected category. Maps each category to a lucide icon.
 * Dependencies: CATEGORIES constant, design/Chip, lucide-react icons.
 * Important notes: "All" is prepended to the category list and clears the category filter.
 *   The ICON_MAP must stay in sync with CATEGORIES for correct icon display.
 */

import { Wrench, Camera, Mountain, Monitor, Music, Sparkles, Car, Gamepad2, MoreHorizontal, Layout } from "lucide-react";
import { CATEGORIES } from "../../../shared/lib/constants";
import { Chip } from "../../../design";

const ICON_MAP = {
  "All": Layout,
  "Tools": Wrench,
  "Cameras & Photography": Camera,
  "Sports & Outdoors": Mountain,
  "Electronics": Monitor,
  "Musical Instruments": Music,
  "Party & Events": Sparkles,
  "Vehicles": Car,
  "Gaming": Gamepad2,
  "Other": MoreHorizontal,
};

export default function CategoryFilter({ value, onChange }) {
  const allCategories = ["All", ...CATEGORIES];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => {
        const Icon = ICON_MAP[cat];
        return (
          <Chip
            key={cat}
            selected={value === cat}
            onClick={() => onChange(cat)}
          >
            {Icon && <Icon size={14} />}
            {cat}
          </Chip>
        );
      })}
    </div>
  );
}
