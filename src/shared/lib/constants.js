/**
 * Application-wide constants.
 *
 * Single source of truth for listing categories, sort options, and
 * image constraints so they stay in sync across forms, validations,
 * and UI components.
 */

/** @type {string[]} Allowed listing categories shown in filter/sort UIs. */
export const CATEGORIES = [
  "Tools",
  "Cameras & Photography",
  "Sports & Outdoors",
  "Electronics",
  "Musical Instruments",
  "Party & Events",
  "Vehicles",
  "Gaming",
  "Other",
];

/** @type {{ value: string, label: string }[]} Sort dropdown options for listing grids. */
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

// ── Image upload limits ─────────────────────────────────────────────
// Kept as plain numbers so they can be used in both UI and validation.

export const MAX_LISTING_IMAGES = 5;
export const MIN_LISTING_IMAGES = 1;
export const MAX_IMAGE_SIZE_MB = 5;

/** MIME types accepted for listing images. */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ── Pagination ──────────────────────────────────────────────────────

/** Number of listings displayed per page. */
export const LISTINGS_PER_PAGE = 12;

// ── Legal version strings ─────────────────────────────────────────
// Bump these when Terms or Privacy Policy content changes materially.
// The profile row records which version the user accepted at signup.

export const TERMS_VERSION = "1.0";
export const PRIVACY_VERSION = "1.0";

// ── Default filter state ────────────────────────────────────────────
// Centralised so the page and URL-sync logic stay in sync.

export const DEFAULT_FILTERS = {
  search: "",
  category: "All",
  location: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
  page: 1,
};
