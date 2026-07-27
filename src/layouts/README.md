# Layouts — Page Layout System

Layout components provide the structural chrome for different sections of the app. They compose with `react-router` `<Outlet />` or wrap children directly.

All layouts are re-exported from `src/layouts/index.js`.

## Available Layouts

| Layout | Purpose | Route Usage |
|--------|---------|-------------|
| `AppLayout` | Top-level layout with Navbar, Footer, and profile completion overlay. Detects dashboard routes and skips its own chrome so `DashboardShell` can take over. | Wraps all public pages via the root router. |
| `PublicLayout` | Simplified layout with Navbar + Footer. Used for non-app pages. | Public marketing/info pages. |
| `AuthLayout` | Centered card layout with logo in the top-left corner. No Navbar or Footer. | Login, Register, Forgot/Reset Password, Email Confirmation. |
| `DashboardLayout` | Simple max-width constrained wrapper (`max-w-5xl`). Used inside `DashboardShell`. | Dashboard child routes. |
| `DashboardShell` | Full dashboard shell with sidebar navigation (desktop), bottom nav (mobile), top bar with page title, user menu, and `<Outlet />`. Handles tab-param redirects. | `/dashboard/*` |
| `ListingLayout` | Max-width constrained wrapper (`max-w-7xl`) for listing detail pages. | Listing detail routes. |
| `Navbar` | Site-wide sticky navigation bar with logo, search, theme toggle, and auth-dependent actions. Used by `AppLayout` and `PublicLayout`. | — |
| `Footer` | Site footer with links and social icons. Used by `AppLayout` and `PublicLayout`. | — |
| `MobileNav` | Slide-out mobile navigation panel. Used by `Navbar`. | — |
| `PageHeader` | Page-level title + optional description and action slot. | Inside page components. |
| `SectionHeader` | Section-level title + optional subtitle and action slot. | Inside page components. |
| `AutoGrid` | Responsive CSS Grid wrapper using `auto-fill` + `minmax()`. Configurable `minWidth` and `gap`. | Listing grids, card layouts. |

## Layout Composition

```
Root Router
├── AppLayout (Navbar + Footer)
│   ├── Public pages (/, /listings, /inbox, etc.)
│   ├── AuthLayout (centered, no chrome)
│   │   └── Login, Register, ForgotPassword, etc.
│   └── DashboardShell (sidebar + bottom nav)
│       └── DashboardLayout (max-w-5xl)
│           └── Dashboard tabs (Analytics, Listings, Bookings, etc.)
└── ListingLayout (max-w-7xl)
    └── ListingDetailPage
```

## Best Practices

- **AppLayout vs PublicLayout** — Use `AppLayout` for the main app; `PublicLayout` for standalone pages.
- **Avoid nesting layout wrappers** — Let the router decide which layout to render based on the route.
- **Dashboard routes** — `AppLayout` detects `/dashboard/*` and renders children without its own chrome. `DashboardShell` provides the complete dashboard experience.
- **Keep layouts thin** — Layouts should only handle structure, not business logic or data fetching.
