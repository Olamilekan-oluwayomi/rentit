# Components — Shared UI Components

Shared UI components used across multiple features/pages. Feature-specific components live in `src/features/*/components/`.

## Directory Structure

```
components/
├── layout/       # Brand + account chrome shared by several layouts
└── dashboard/    # Dashboard tab content panels
```

> The site chrome (Navbar, Footer, MobileNav) lives in `src/layouts/`, not here.
> `src/layouts/AppLayout.jsx`, `PublicLayout.jsx`, and `DashboardShell.jsx` each
> own their own `<main>` and skip-to-content link.

## layout/

| Component  | Purpose | Consumed by |
|------------|---------|-------------|
| `Logo`     | Brand wordmark. Links to `/`. | `layouts/Navbar`, `layouts/Footer`, `layouts/MobileNav`, `layouts/DashboardShell`, `layouts/AuthLayout` |
| `UserMenu` | Account dropdown (profile link, dashboard, sign out) for logged-in users. | `layouts/Navbar` |

## dashboard/

| Component       | Purpose | Consumed by |
|-----------------|---------|-------------|
| `MyListingsTab` | Lists the current user's listings with edit/delete actions. Used as the list view of `pages/dashboard/Listings.jsx`. | `pages/dashboard/Listings.jsx` |

The `MyRentalsTab` / `RequestsTab` / `RentedOutTab` components were removed. Their
behaviour now lives in a single role-aware page at `pages/dashboard/Bookings.jsx`
(Lending / Renting). That page renders its own `BookingRow` / `BookingCard`
internally and reuses only `ConfirmDialog`, `FadeInSection`, `StatusBadge`, and
`ReviewPrompt`.

## Best Practices

- **Keep them shared** — If a component is only used in one feature, put it in `src/features/<feature>/components/` instead.
- **Use design primitives** — Build on top of `src/design/` components. Don't add new design tokens here.
- **No business logic** — Layout components should not contain data-fetching logic. Pass data via props or context.
- **Mobile-first** — All layout components should be responsive by default.