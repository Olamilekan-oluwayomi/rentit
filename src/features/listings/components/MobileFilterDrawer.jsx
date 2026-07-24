/**
 * MobileFilterDrawer — Bottom-sheet filter panel for mobile/tablet.
 *
 * Opens as a slide-up overlay containing all filter controls
 * (Category, Location, Price, Sort) plus Clear and Apply buttons.
 * Applies filters only when "Apply" is tapped to avoid constant
 * re-fetching while the user is still filling in fields.
 *
 * The component unmounts when closed, so draft state is always
 * initialized from the current filters when opened.
 */

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CATEGORIES, SORT_OPTIONS } from "../../../shared/lib/constants";
import PriceFilter from "./PriceFilter";

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onApply: (filters: object) => void,
 *   filters: object
 * }} props
 */
export default function MobileFilterDrawer({ open, onClose, onApply, filters }) {
  // Local draft state — only committed on "Apply".
  // Initialized from props each time the component mounts (when open becomes true).
  const [draft, setDraft] = useState(filters);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleClear = () => {
    setDraft({
      search: "",
      category: "All",
      location: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      page: 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full bg-surface rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-surface z-10">
          <h2 className="text-lg font-heading font-semibold text-text-primary">Filters</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter controls */}
        <div className="px-5 py-5 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {["All", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDraft((d) => ({ ...d, category: cat, page: 1 }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    draft.category === cat
                      ? "bg-accent text-white"
                      : "bg-gray-100 dark:bg-white/5 text-text-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Location</label>
            <input
              type="text"
              value={draft.location}
              onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value, page: 1 }))}
              placeholder="City, Country"
              className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Price Range</label>
            <PriceFilter
              min={draft.minPrice}
              max={draft.maxPrice}
              onChange={(min, max) => setDraft((d) => ({ ...d, minPrice: min, maxPrice: max, page: 1 }))}
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Sort By</label>
            <select
              value={draft.sort}
              onChange={(e) => setDraft((d) => ({ ...d, sort: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-transparent text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-white/10 flex gap-3 sticky bottom-0 bg-surface">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-white/15 text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
