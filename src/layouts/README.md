# Layouts — Page Layout System

Layout components provide the structural chrome for different sections of the app. They compose with `react-router` `<Outlet />` or wrap children directly.

All layouts are re-exported from `src/layouts/index.js`.

## Available Layouts

| Layout | Purpose | Route Usage |
|--------|---------|-------------|
| `AppLayout` | Top-level layout with Navbar, Footer, and profile completion overlay. Detects dashboard routes and skips its own chrome so `DashboardShell` can take over. | `/profile`, `/listings/new`, `/listings/:id/edit`, `/inbox`, `/favorites`, `/booking/:id` |
| `PublicLayout` | Simplified layout with Navbar + Footer. Used for non-app pages. | `/`, `/listings/:id`, `/users/:userId`, `/about`, `/contact`, `/privacy`, `/terms`, `/pricing`, and the catch-all 404 |
| `AuthLayout` | Complete chrome-free page: logo top-left, theme toggle top-right, centered card. Renders no Navbar or Footer. | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/confirm` — declared outside `PublicLayout`, so it is the whole page |
| `DashboardLayout` | Simple max-width constrained wrapper (`max-w-5xl`). Not part of the dashboard — `DashboardShell` renders `/dashboard/*` directly. | `features/profile/ProfilePage` only |
| `DashboardShell` | Full dashboard shell with sidebar navigation (desktop), bottom nav (mobile), top bar with page title, user menu, and `<Outlet />`. Handles tab-param redirects. Lazy-loaded. | `/dashboard/*` |
| `Navbar` | Site-wide sticky navigation bar with logo, search, theme toggle, and auth-dependent actions. Used by `AppLayout` and `PublicLayout`. | — |
| `Footer` | Site footer with links and social icons. Used by `AppLayout` and `PublicLayout`. | — |
| `MobileNav` | Slide-out mobile navigation panel. Used by `Navbar`. | — |
| `PageHeader` | Page-level title + optional description and action slot. | Inside page components. |
| `SectionHeader` | Section-level title + optional subtitle and action slot. | Inside page components. |
| `AutoGrid` | Responsive CSS Grid wrapper using `auto-fill` + `minmax()`. Configurable `minWidth` and `gap`. | Listing grids, card layouts. |

## Layout Composition

```
Root Router (src/App.jsx)
├── PublicLayout (Navbar + Footer)
│   ├── Landing / About / Contact / Privacy / Terms / Pricing
│   ├── ListingDetailPage, PublicProfilePage
│   └── NotFoundPage (catch-all *)
├── AuthLayout (no site chrome; owns its own theme toggle)
│   └── Login, Register, Forgot/Reset Password, Email Confirmation
├── AppLayout (Navbar + Footer + profile completion overlay)
│   └── Profile, NewListing, EditListing, Inbox, Favorites, BookingChat
└── DashboardShell (sidebar + bottom nav, lazy)
    └── Dashboard tabs (Home, Analytics, Listings, Bookings, Messages,
                        Notifications, Settings)
```

`AppLayout` is skipped entirely for `/dashboard/*`; `DashboardShell` is a sibling
route group rather than a child of `AppLayout`. The auth routes are likewise a
sibling group — placing them under `PublicLayout` would wrap a chrome-free page
in a second Navbar and Footer.

## Best Practices

- **AppLayout vs PublicLayout** — Use `AppLayout` for the main app; `PublicLayout` for standalone pages.
- **Avoid nesting layout wrappers** — Let the router decide which layout to render based on the route.
- **Dashboard routes** — `AppLayout` detects `/dashboard/*` and renders children without its own chrome. `DashboardShell` provides the complete dashboard experience.
- **Keep layouts thin** — Layouts should only handle structure, not business logic or data fetching.
