/**
 * Pagination — Page navigation with ellipsis for large page sets.
 *
 * Route: Listings page ("/listings") — at the bottom of the listing grid.
 * Responsibilities: Renders Previous/Next buttons and a compact page number list
 *   with ellipsis for large page counts. Highlights the current page.
 * Dependencies: lucide-react/ChevronLeft + ChevronRight, getPageNumbers helper.
 * Important notes: Hidden when totalPages <= 1. Uses "..." as a visual separator
 *   when page ranges grow beyond 7. Previous/Next show/hide labels on small screens.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12"
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-text-primary hover:bg-surface-secondary disabled:opacity-40 disabled:pointer-events-none transition-all duration-fast ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-9 h-9 flex items-center justify-center text-sm text-text-muted"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-fast ease ${
                p === page
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              }`}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-text-primary hover:bg-surface-secondary disabled:opacity-40 disabled:pointer-events-none transition-all duration-fast ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  pages.push(1);

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}
