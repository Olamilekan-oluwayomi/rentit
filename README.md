# RentIt

A peer-to-peer rental marketplace where users can list items for rent and browse available rentals.

## Tech Stack

- **Frontend**: React 19, React Router v7, Tailwind CSS v4
- **Backend**: Supabase (auth, database, storage, real-time)
- **Animation**: Motion (Framer Motion API)
- **Forms/Validation**: react-hook-form + Zod
- **Date handling**: date-fns, react-day-picker
- **Build tool**: Vite 8
- **Icons**: lucide-react

## Getting Started

### Prerequisites

- Node.js 22.19+ (24 LTS recommended — jsdom 30's undici dependency requires it)
- A [Supabase](https://supabase.com) project

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VITE_IMAGE_TRANSFORMS=off
```

`VITE_VAPID_PUBLIC_KEY` is only needed for web push notifications (see the
[`send-notification` Edge Function](./supabase/functions/send-notification)).

`VITE_IMAGE_TRANSFORMS` controls whether listing and avatar images are served
through Supabase's on-the-fly `/render/image/` endpoint, which resizes and
converts to WebP. **That endpoint requires a paid Supabase plan** — on the free
tier the requests fail and every image breaks, so the default is `off`. Set it
to `on` once the project is on Pro. Images are resized client-side before upload
regardless (see `src/utils/imageCompression.js`), so originals stay bounded.

This cannot be auto-detected: the endpoint errors on a missing object regardless
of plan, so a probe cannot tell "unsupported" from "not found". If you set the
flag to `on` on a free tier, each image falls back to its raw URL on error, so
images still load — just with an extra failed request apiece.

### Install & Run

```bash
npm install
npm run dev
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit + integration tests (Vitest, watch mode) |
| `npx vitest run` | Run the test suite once and exit — what CI uses |
| `npm run test:e2e` | Run end-to-end tests (Playwright, headless) |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI mode |

### Continuous Integration

`.github/workflows/ci.yml` runs on every push and pull request to `main`, and
publishes the `dist` build as an artifact (7-day retention). It runs exactly what
is verified locally:

```
npm run lint
npx vitest run
npm run build
```

E2E specs (`npm run test:e2e`) are deliberately **not** in CI — they need a
deployed Supabase project and real credentials, so they are a manual pre-release
check rather than a per-commit gate.

## Features

### Landing Page (Marketing)
- Hero section, category grid with live counts, testimonials carousel, FAQ accordion
- Smart redirect: logged-in users see the browse view; logged-out users see the marketing landing

### Public Pages
- **About** (`/about`) — platform overview, how it works, categories, why it matters
- **Contact** (`/contact`) — form inserts into `contact_messages` table, pre-fills from auth if logged in
- **Privacy** (`/privacy`) — full privacy policy, dated July 28, 2026
- **Terms** (`/terms`) — terms of service, visually matches Privacy page
- **Pricing** (`/pricing`) — honest placeholder ("coming soon"), no fake tiers

### Listings
- Browse all available listings with search, category, price, and location filters
- Sort by newest, oldest, or price
- Paginated results (12 per page)
- Create, edit, and manage your own listings with multi-image upload (up to 5 images)
- Image lightbox gallery with keyboard navigation
- Categories: Tools, Cameras & Photography, Sports & Outdoors, Electronics, Musical Instruments, Party & Events, Vehicles, Gaming, Other
- Soft delete (hide from browse) and hard delete with storage cleanup

### Favorites
- Heart icon on listing cards to save/unsave listings (`useFavorites` context, optimistic toggle with rollback + toast on error)
- `/favorites` page (protected) showing all saved listings with remove capability
- Guests get an info toast prompting sign-in when trying to save

### Booking System
- Date range picker with blocked-date awareness (react-day-picker)
- Race-condition defense: re-validates availability at submission time
- Owner blocking/unblocking of date ranges with optional reason
- Booking statuses: Pending, Approved, Declined, Completed, Cancelled
- Profile-completeness gate: logged-in users with incomplete profiles are prompted to complete their profile before booking

### Messages & Inbox
- Real-time messaging on individual booking threads (Supabase real-time subscriptions)
- Optimistic message sending with auto-scroll
- Unread count badge on inbox
- "Contact Owner" button on listing detail pages initiates a conversation thread
- Mark messages as read on open
- Delete conversations per-user (hidden from your inbox only; reappears if the other person sends a new message)
- Click counterparty avatar/name to view their public profile

### Web Push Notifications
- Opt-in banner on the dashboard plus a toggle in Settings (powered by `usePushNotifications`)
- Service worker (`public/sw.js`) registers a VAPID subscription; a shared IndexedDB store lets it re-subscribe and upsert on `pushsubscriptionchange`
- Backend delivery: `push_subscriptions` table, pg_net triggers, and the `send-notification` Edge Function (`supabase/functions/send-notification`)
- Notifies on new booking requests, booking status changes (approved/declined), and new messages; stale push endpoints are pruned automatically
- Requires `VITE_VAPID_PUBLIC_KEY` and a secure context (HTTPS or localhost)

Two server-side secrets are required, both held in Supabase Vault (encrypted at
rest) rather than in source control or environment files:

| Vault secret name | Purpose |
|-------------------|---------|
| `push_webhook_secret` | Must match the `WEBHOOK_SECRET` env var on the Edge Function |
| `push_function_url` | The Edge Function base URL — kept in Vault so the Supabase project ref is never committed |

```sql
SELECT vault.create_secret('<WEBHOOK_SECRET>', 'push_webhook_secret');
SELECT vault.create_secret(
  'https://<project-ref>.supabase.co/functions/v1/send-notification',
  'push_function_url'
);
```

Deploy the function with `--no-verify-jwt`; it authenticates callers with the
`x-rentit-webhook-secret` header instead of a JWT. See
[`20260804000000_webpush_pg_net_triggers.sql`](./supabase/migrations/20260804000000_webpush_pg_net_triggers.sql)
for the rationale and the non-Vault fallback.

### Reviews
- Leave reviews after completed bookings
- Star rating (1–5) with text review
- Review eligibility check (must have completed the booking)
- Paginated reviews section on listing detail pages
- Owner rating aggregation (average_rating + rating_count)

### Dashboard

Six routes under `/dashboard`, all lazy-loaded behind `DashboardShell`:

- **Home** (`/dashboard`) — overview stat cards for active rentals, pending
  requests, listings, and unread messages. "Total Earnings" is a stub.
- **My Listings** (`/dashboard/listings`) — your listings with pending-request
  counts; grid and list views, edit/delete, and a hide-from-browse / restore toggle
- **Bookings** (`/dashboard/bookings`) — role-aware page for both sides of a
  booking:
  - *Lending* — every booking on your listings, with **approve** and **decline**
    on pending requests. Approving also writes a blocked range to the listing's
    calendar so the dates cannot be double-booked.
  - *Renting* — bookings you made, with **cancel** while pending or approved.
  - Both sides show a **review prompt** once the rental period has ended.
  - Destructive actions go through a confirmation dialog, and the status filter
    covers all five statuses including `declined`.
- **Messages** (`/dashboard/messages`) — inbox-style list across booking threads
- **Notifications** (`/dashboard/notifications`) — placeholder empty state (see
  [Not Yet Built](#not-yet-built))
- **Settings** (`/dashboard/settings`) — profile editing and the web push toggle;
  2FA and payouts are placeholders

### Profile
- Edit name, bio, and location
- Auto-detect current location via browser Geolocation API
- Avatar upload with client-side compression (1200×1200, 0.8 quality)
- Initials fallback when no avatar
- OAuth avatar auto-population (Google, Apple, generic)
- Public profile page at `/users/:userId` — read-only view with avatar, bio, rating/reviews, and active listings

### Auth
- Email/password registration and login
- Google OAuth
- Email confirmation flow with auto-redirect
- Forgot/reset password with secure token flow
- Guest routes (redirect logged-in users away from login/register)
- Protected routes (redirect unauthenticated users to login)
- Redirect-after-login via `?redirect=` search param
- **ToS/Privacy acceptance at signup** — required checkbox, metadata passed through sign-up and stored in profile

## Testing

### Unit & Integration (Vitest + React Testing Library)

Unit and integration tests run with Vitest 4, jsdom, and `@testing-library`. Unit tests are co-located next to the code they test (`*.test.js/jsx` in the feature/hook folders); integration tests live in `src/test/integration/`:

```bash
npm test            # run all unit + integration tests
npm test -- --ui    # Vitest UI mode
```

**Coverage areas:**

| File | Type | Tests |
|------|------|-------|
| `features/auth/components/RegisterPage.test.jsx` | Unit | 7 — rendering, ToS gate, password mismatch, signUp args, confirmation, failure, ToS/Privacy links |
| `features/auth/context/AuthContext.test.jsx` | Unit | 9 — loading state, session resolution, user set, sign out, signUp/signIn/OAuth calls + errors |
| `features/bookings/components/StatusBadge.test.jsx` | Unit | 2 — text per status, variant class |
| `features/bookings/hooks/useAvailability.test.js` | Unit | 7 — blocked ranges, empty, error, loading, null listingId, params, refetch |
| `features/bookings/hooks/useCreateBooking.test.js` | Unit | 5 — clear range, overlap rejection, avail fetch error, submitting state, insert fields |
| `features/bookings/hooks/useBookings.test.js` | Unit | 8 — renter view, requests view, rented-out view, owner view (no status filter), no-listings guard, fetch errors |
| `features/listings/components/NewListingPage.test.jsx` | Unit | 6 — form render, validations, submission, categories, insert failure toast |
| `features/bookings/components/AvailabilityCalendar.test.jsx` | Unit | 6 — renter/owner views, availability info, blocked notice/error/dates |
| `features/reviews/hooks/useReviewEligibility.test.js` | Unit | 7 — approved+ended rules, pending/cancelled denial, existing review flips to edit |
| `pages/dashboard/Bookings.test.jsx` | Integration | 18 — confirm-before-write, approve + availability block, partial failure, decline, cancel, status filter, empty states, renter/owner role split, loading skeleton, fetch error, refetch after write, cancelled write makes no refetch |
| `utils/storage.test.js` | Unit | 12 — raw-URL fallback, transform opt-in, `handleImageError` retry incl. reused-`src` regression |
| `test/integration/RegisterFlow.test.jsx` | Integration | 4 — full register→confirmation→login flow, error stay |
| `test/integration/BookingFlow.test.jsx` | Integration | 4 — listing loading, data render, booking card, not-found |
| `test/integration/InboxRowNavigation.test.jsx` | Integration | 6 — keyboard row nav, avatar/name profile links, title/preview/whitespace clicks |

**Total: 101 tests across 14 files.**

### End-to-End (Playwright)

E2E tests require Playwright browsers installed first:

```bash
npx playwright install chromium
npm run test:e2e          # headless
npm run test:e2e:ui       # interactive UI mode
```

The Playwright config (`playwright.config.js`) starts the Vite dev server automatically and runs against Chromium. Tests cover:

- **Auth flow** (`auth-flow.spec.js`, 3 tests) — register → confirmation screen, login → home redirect, password mismatch rejection
- **Browse flow** (`browse-book-flow.spec.js`, 4 tests) — landing page, invalid listing 404, skeleton→error transition, all 5 public pages

**Total: 7 E2E tests.**

---

## Architecture

### Feature-Based Organization

Code is organized by feature, not by type. Each feature folder is self-contained:

```
src/features/
├── auth/       # AuthContext, login, register, forgot/reset, route guards
├── bookings/   # Availability calendar, booking hooks, status badge
├── landing/    # Marketing page sections (hero, FAQ, testimonials)
├── listings/   # Listing CRUD, image gallery, filters, search
├── favorites/  # Save/unsave listings, favorites page
├── messages/   # Real-time chat, inbox, unread counts, contact owner
├── notifications/ # Web push opt-in, subscription management
├── profile/    # ProfileContext, avatar, completion overlay, profile form
└── reviews/    # Review form, prompts, paginated reviews section
```

### Design System

All design primitives live in `src/design/` and are re-exported from `src/design/index.js`. Available components:

- **Button** — variants: primary, outline, danger; sizes: sm, md, lg
- **IconButton** — icon-only variant for toolbars/modals
- **Input** — text input with label, error, icon slot
- **Card** — container with surface styling
- **Chip** — compact label/tag
- **Badge** — status badge (sage, sage-filled, amber, etc.)
- **Avatar** — image with initials fallback; sizes: sm, md, lg, xl
- **Skeleton** — loading placeholder
- **StarRating** — display/input ratings (1–5 stars)
- **Typography** — consistent heading/body text styling
- **Container, Section, Divider** — layout primitives
- **EmptyState** — empty state with icon, title, description, action

Design tokens are defined in `src/index.css` using Tailwind v4 `@theme` directives. Key tokens: `accent`, `surface`, `surface-secondary`, `text-primary`, `text-secondary`, `text-muted`, `danger`, `success`, `border`, `font-heading`.

### Layout System

Layouts wrap pages and compose the app shell. Three of them are React Router
layout routes (they render an `<Outlet>`), two take `children` directly:

| Layout | Renders | Used by |
|--------|---------|---------|
| `PublicLayout` | Navbar + `<main>` + Footer | Landing, `/listings/:id`, `/users/:userId`, `/about`, `/contact`, `/privacy`, `/terms`, `/pricing`, and the catch-all 404 |
| `AppLayout` | Navbar + `<main>` + Footer (footer suppressed on `/inbox` and `/booking/:id`) | `/profile`, `/listings/new`, `/listings/:id/edit`, `/favorites`, `/inbox`, `/booking/:id` |
| `DashboardShell` | Sidebar (desktop) or drawer + bottom nav (mobile) + `<Outlet />`. Lazy-loaded. | All `/dashboard/*` routes |
| `AuthLayout` | Whole chrome-free page: logo, theme toggle, centered card | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/confirm` — declared as a top-level route group, **not** nested in `PublicLayout`, so it has no Navbar or Footer |
| `DashboardLayout` | Max-width (`max-w-5xl`) content wrapper | `features/profile/ProfilePage` only — not part of the dashboard |

`PublicLayout`, `AppLayout`, and `DashboardShell` each render their own
`<main id="main-content">` plus a skip-to-content link. `AuthLayout` renders a
plain `<main>` because it is the entire page; it supplies its own theme toggle
since the `Navbar` toggle is absent on these routes.

### Not Yet Built

These are stubbed rather than implemented, so they are listed here instead of
being described as features:

| Area | Current state |
|------|---------------|
| **Analytics** (`/dashboard/analytics`) | Only the summary stat cards are wired up. Revenue and booking charts are placeholder blocks with no data behind them. |
| **Earnings / payouts** | `Total Earnings` on the dashboard is hardcoded to `$0.00`; the Settings payout section says "coming soon". There is no payment integration. |
| **Notifications feed** (`/dashboard/notifications`) | Static empty state. Push notifications work independently of this page. |
| **Pricing** (`/pricing`) | Honest placeholder page. No tiers, no fees. |
| **Two-factor auth** | Placeholder row in Settings. |
| **Booking completion** | No automatic transition to `completed` and no owner-side "mark returned" action. A booking must reach `completed` some other way for reviews to unlock. |

### Data Flow

1. **Supabase** is the single source of truth (auth, database, storage)
2. **React Context** providers — AuthContext, ProfileContext, ThemeContext, ToastContext are composed in `main.jsx`; FavoritesProvider wraps the routes in `App.jsx` — and provide global state
3. **Custom hooks** co-located with features handle API calls, caching, and side effects
4. **Optimistic updates** in messaging provide instant UI feedback
5. **Real-time subscriptions** (via Supabase channels) keep messages in sync across sessions

### Accessibility

- `prefers-reduced-motion` respected throughout (animations, scroll-to-top)
- Skip-to-content link on page load
- Back-to-top button on long pages
- ARIA labels on navigation, icons, and interactive elements
- Focus-visible ring styles on all interactive elements
- Keyboard navigation on gallery lightbox, mobile menus, and date picker

## Project Structure

```
src/
├── features/               # Feature-based modules
│   ├── auth/               # AuthContext, login/register, route guards
│   │   ├── context/
│   │   └── components/
│   ├── bookings/           # Booking hooks, calendar, status badge
│   │   ├── hooks/
│   │   └── components/
│   ├── landing/            # Marketing page sections
│   │   ├── hooks/
│   │   └── components/
│   ├── listings/           # Listing CRUD, gallery, filters
│   │   ├── hooks/
│   │   └── components/
│   ├── favorites/          # Favorites context, /favorites page
│   │   ├── hooks/
│   │   └── components/
│   ├── messages/           # Real-time chat, inbox, contact owner
│   │   ├── hooks/
│   │   └── components/
│   ├── notifications/      # Web push hook, opt-in banner
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── components/
│   ├── profile/            # ProfileContext, form, avatar, completion overlay
│   │   ├── context/
│   │   ├── hooks/
│   │   └── components/
│   └── reviews/            # Reviews section, form, eligibility check
│       ├── hooks/
│       └── components/
├── shared/                 # Cross-feature code
│   ├── components/         # AnimatedList, ConfirmDialog, BackToTop, EmptyState, BookingMeta, etc.
│   ├── contexts/           # ThemeContext, ToastContext
│   ├── hooks/              # useCurrentLocation
│   └── lib/                # Supabase client, constants, Zod validations
├── components/             # Shared across layouts
│   ├── dashboard/          # MyListingsTab (list view for /dashboard/listings)
│   └── layout/             # Logo, UserMenu
├── layouts/                # Page layout components + a README
├── pages/                  # Top-level routed pages
│   └── dashboard/          # Dashboard sub-pages (lazy-loaded)
├── design/                 # Design system primitives
├── test/                   # Tests
│   ├── e2e/                # Playwright E2E tests
│   ├── integration/        # Integration tests (Vitest + RTL)
│   └── setup.js            # Vitest setup (jest-dom matchers, IntersectionObserver polyfill)
├── utils/                  # avatar, imageCompression, location, storage
├── hooks/                  # Documentation only — hooks are co-located with features
├── App.jsx                 # Route definitions
├── main.jsx                # Entry point — provider composition
└── index.css               # Tailwind v4 theme + design tokens
```

Architecture decisions are recorded in [`docs/decisions/`](./docs/decisions), with
the reasoning linked back to the commits that introduced it.

## Database Schema

> **Versioning caveat.** Only the tables in `supabase/migrations/` are
> reproducible from this repository. The base tables (`profiles`, `listings`,
> `bookings`, `availability`, `reviews`, `contact_messages`) were created
> directly in the Supabase dashboard and are documented here for reference
> only — the SQL is not in the repo. The migrations under
> `supabase/migrations/` are the ones to re-run against a fresh project.

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | References `auth.users.id` |
| full_name | text | Display name (min 2 chars) |
| avatar_url | text | Storage path to avatar |
| bio | text | User bio |
| location | text | User location |
| average_rating | numeric | Computed from reviews (0–5) |
| rating_count | integer | Total review count |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-set |

### `listings`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| owner_id | uuid | References `profiles.id` |
| title | text | Listing title |
| description | text | Listing description |
| category | text | One of the defined categories |
| daily_price | numeric | Price per day |
| location | text | Listing location |
| images | text[] | Storage paths to images |
| is_active | boolean | Whether listing is published |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-set |

### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| listing_id | uuid | References `listings.id` |
| renter_id | uuid | References `profiles.id` |
| start_date | date | Rental start date |
| end_date | date | Rental end date |
| total_price | numeric | Computed total |
| status | text | pending / approved / declined / completed / cancelled |
| owner_message | text | Optional message from owner on approve/decline |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-set |

### `availability`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| listing_id | uuid | References `listings.id` |
| start_date | date | Blocked range start |
| end_date | date | Blocked range end |
| is_blocked | boolean | Whether the range is unavailable |
| reason | text | Optional reason for blocking |

### `reviews`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| booking_id | uuid | References `bookings.id` |
| reviewer_id | uuid | References `profiles.id` (author of the review) |
| reviewee_id | uuid | References `profiles.id` (the user being reviewed) |
| rating | smallint | 1–5 |
| comment | text | Review text (nullable) |
| created_at | timestamptz | Auto-set |

> **Not versioned in this repo.** The `reviews` table and its three constraints
> (`booking must be approved`, `booking has not ended`, one review per booking)
> were created directly in the Supabase dashboard. The client maps those
> constraint names to friendly copy in `src/features/reviews/components/ReviewForm.jsx`.

### `messages`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | Primary key |
| booking_id | uuid | References `bookings.id` |
| sender_id | uuid | References `profiles.id` |
| content | text | Message body |
| is_read | boolean | Read status |
| created_at | timestamptz | Auto-set |

### `conversation_hidden`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| booking_id | uuid | References `bookings.id` |
| user_id | uuid | References `auth.users.id` |
| deleted_at | timestamptz | When the user hid the conversation |

### `favorites`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | References `auth.users.id` |
| listing_id | uuid | References `listings.id` |
| created_at | timestamptz | Auto-set |

`UNIQUE(user_id, listing_id)` prevents duplicate saves.

### `push_subscriptions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | References `auth.users.id` |
| endpoint | text | Push service endpoint; unique per browser/device |
| p256dh | text | Subscription ECDH public key (base64url) |
| auth | text | Subscription auth secret (base64url) |
| user_agent | text | Optional device/browser label |
| created_at | timestamptz | Auto-set |

## RLS Policies

- **listings**: Public read, owner-only write
- **bookings**: Renters can view their own; owners can view bookings on their listings; renters can insert with their own ID; either party can update
- **profiles**: Public read, owner-only write
- **availability**: Owner-only management (insert/update/delete)
- **reviews**: Public read, reviewer insert with own ID
- **messages**: Read if user is participant, insert as self, update `is_read` if recipient
- **conversation_hidden**: Users can view, insert, and delete only their own rows
- **favorites**: Read, insert, and delete only your own rows
- **push_subscriptions**: View, insert, and delete your own rows (no UPDATE — key rotation is delete + reinsert); the `send-notification` Edge Function reads with the service_role key, bypassing RLS

## Documentation Conventions

Each file includes a header comment documenting purpose, route (if applicable), responsibilities, dependencies, and notes. Custom hooks document inputs, outputs, and side effects. Design system components document variants, usage, and accessibility.

<!-- Remove /src subdirectory READMEs if they become stale; they describe their directory's architecture -->
