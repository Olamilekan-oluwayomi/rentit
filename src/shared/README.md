# Shared — Shared Utilities, Components, and Contexts

Code used across multiple features. This is the "commons" layer — anything that doesn't belong to a single feature lives here.

## Directory Structure

```
shared/
├── components/     # Reusable UI components (not design primitives)
├── contexts/       # Application-wide React contexts
├── hooks/          # Shared custom hooks
└── lib/            # Third-party clients, constants, validations
```

## Components

| Component | Purpose |
|-----------|---------|
| `AnimatedList` | Staggered entrance animation wrapper for lists. Uses `motion/react`. Respects `prefers-reduced-motion`. |
| `BackToTop` | Floating button that scrolls the page to the top when clicked. |
| `BookingListSkeleton` | Loading skeleton specifically for booking list layouts. |
| `BookingMeta` | Displays booking metadata (dates, status, price) in a compact format. |
| `ConfirmDialog` | Modal confirmation dialog for destructive actions. |
| `EmptyState` | Placeholder for empty states (can also use `design` EmptyState for design-system-only cases). |
| `FadeInSection` | Scroll-triggered fade-in animation wrapper using Intersection Observer. |
| `ListingThumbnail` | Small listing image thumbnail with fallback. |
| `RenterInfo` | Displays renter profile info in a compact card. |
| `ScrollToTop` | Scrolls to top on route change. Used in the router. |

## Contexts

| Context | Provider | Purpose |
|---------|----------|---------|
| `ThemeContext` | `ThemeProvider` | Light/dark theme state. Persists to `localStorage`, syncs `.dark` class on `<html>`. Provides `theme` and `toggleTheme`. |
| `ToastContext` | `ToastProvider` | Lightweight toast notification system. Provides `addToast(message, type)` where type is `success | error | info`. Auto-dismisses after 3 seconds. |

## Hooks

| Hook | Purpose |
|------|---------|
| `useCurrentLocation` | Uses the browser Geolocation API + OpenStreetMap Nominatim reverse geocoding to resolve the user's current city. Returns `{ getCurrentLocation, loading, error }`. |

## Library (`lib/`)

| Module | Purpose |
|--------|---------|
| `supabase.js` | Singleton Supabase client instance. Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from env. |
| `constants.js` | App-wide constants: `CATEGORIES`, `SORT_OPTIONS`, image upload limits (`MAX_LISTING_IMAGES`, `MAX_IMAGE_SIZE_MB`), `LISTINGS_PER_PAGE`, `DEFAULT_FILTERS`. Single source of truth. |
| `validations.js` | Zod validation schemas for listing forms: `listingSchema`, `listingFormSchema`, `listingEditFormSchema`, `listingEditImagesSchema`. Reuses constants from `constants.js`. |

## Best Practices

- **Don't duplicate** — If logic is shared by two or more features, it belongs here.
- **Don't bloat** — If a shared component grows feature-specific logic, reconsider its placement.
- **Export cleanly** — Avoid barrel files; import directly from the file path.
- **Keep lib/ agnostic** — `lib/` modules should not import from components or hooks.
