# 0007 — Lazy-load every route with `React.lazy`

**Status:** Accepted

## Context

The Supabase client alone is roughly 200 KB of the bundle, and a visitor landing
on the marketing homepage should not pay to download the dashboard, the listing
form, or the auth pages. Route-level splitting was added along with the dashboard
pages and the favorites feature.

## Decision

Route components are loaded with `React.lazy` and rendered inside a `<Suspense>`
boundary.

Two deliberate exceptions are eagerly imported:

- `LandingPage` is in the main bundle. It is the default `/` route and paints
  first, so it must not wait on a chunk fetch or on the auth session lookup that
  decides whether `HomePage` replaces it.
- `AppLayout` and `PublicLayout` stay eager so the page chrome renders immediately
  and the Suspense fallback appears *inside* the frame rather than replacing it.

`DashboardShell` is lazy-loaded like the pages it wraps. It is only reachable
behind a `ProtectedRoute`, so eager-loading it would make every logged-out
visitor download dashboard chrome they cannot see.

Suspense fallbacks are shaped like the content they replace — the dashboard falls
back to a skeleton with the same block structure, not a spinner — so the layout
does not jump when the chunk arrives.

## Consequences

- A visitor to `/` downloads `LandingPage`, `PublicLayout`, and the Supabase
  client. Authenticated routes and the dashboard load on navigation.
- Every navigation between routes pays a chunk fetch. On a cold cache that is a
  short delay, mitigated by the shaped fallbacks.
- A missing or broken chunk fails that route only.
- The catch-all 404 is lazy-loaded like any other page, which is consistent and
  cheap, though it means the catch-all has the same load cost as a real page.
- Because `DashboardShell` is lazy, entering `/dashboard` briefly shows the
  Suspense fallback with no chrome at all. That is the intended trade: a guest on
  `/` should not pay for the shell, and an owner entering the dashboard already
  expects a load.