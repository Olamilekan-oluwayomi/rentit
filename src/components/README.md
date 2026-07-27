# Components — Shared UI Components

Shared UI components used across multiple features/pages. Feature-specific components live in `src/features/*/components/`.

## Directory Structure

```
components/
├── layout/       # Site-wide chrome (Header, Footer, navigation)
└── dashboard/    # Dashboard tab content panels
```

## layout/

| Component      | Purpose |
|----------------|---------|
| `Layout`       | Top-level shell: renders `Header` + `<main>` + `Footer`. Omits footer on messaging routes (`/inbox`, `/booking/:id`). Injects skip-to-content link and `ProfileCompletionOverlay`. |
| `Header`       | Sticky site header with logo, search bar, theme toggle, auth-dependent actions (Log In/Sign Up vs New Listing + notifications + UserMenu), and hamburger menu on mobile. |
| `Footer`       | Site footer with marketplace links, company links, social links, and copyright. |
| `MobileMenu`   | Slide-out navigation panel for mobile users, rendered by `Header`. |
| `UserMenu`     | Dropdown menu for logged-in users (profile link, dashboard, sign out). |
| `Logo`         | Brand logo component used by Header, AuthLayout, and DashboardShell. |

## dashboard/

| Component       | Purpose |
|-----------------|---------|
| `MyListingsTab` | Lists the current user's listings with edit/delete actions. |
| `MyRentalsTab`  | Shows items the user is currently renting. |
| `RequestsTab`   | Shows booking requests from other users on the user's listings. |
| `RentedOutTab`  | Shows items the user has lent out to others. |

## Best Practices

- **Keep them shared** — If a component is only used in one feature, put it in `src/features/<feature>/components/` instead.
- **Use design primitives** — Build on top of `src/design/` components. Don't add new design tokens here.
- **No business logic** — Layout components should not contain data-fetching logic. Pass data via props or context.
- **Mobile-first** — All layout components should be responsive by default.
