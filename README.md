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

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

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

## Features

### Landing Page (Marketing)
- Hero section, category grid with live counts, testimonials carousel, FAQ accordion
- Smart redirect: logged-in users see the browse view; logged-out users see the marketing landing

### Listings
- Browse all available listings with search, category, price, and location filters
- Sort by newest, oldest, or price
- Paginated results (12 per page)
- Create, edit, and manage your own listings with multi-image upload (up to 5 images)
- Image lightbox gallery with keyboard navigation
- Categories: Tools, Cameras & Photography, Sports & Outdoors, Electronics, Musical Instruments, Party & Events, Vehicles, Gaming, Other
- Soft delete (hide from browse) and hard delete with storage cleanup

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

### Reviews
- Leave reviews after completed bookings
- Star rating (1–5) with text review
- Review eligibility check (must have completed the booking)
- Paginated reviews section on listing detail pages
- Owner rating aggregation (average_rating + rating_count)

### Dashboard
- **Home** — overview stats (bookings, listings, messages)
- **My Listings** — view your listed items with pending request counts
- **My Rentals** — track all your outgoing booking requests
- **Requests** — manage incoming booking requests (approve/decline)
- **Rented Out** — view approved and completed rentals with earnings stats
- **Messages** — inbox-style message list across all booking threads
- **Analytics** — booking and earnings charts
- **Notifications** — recent booking activity
- **Settings** — profile editing

### Profile
- Edit name, bio, and location
- Auto-detect current location via browser Geolocation API
- Avatar upload with client-side compression (1200×1200, 0.8 quality)
- Initials fallback when no avatar
- OAuth avatar auto-population (Google, Apple, generic)

### Auth
- Email/password registration and login
- Google OAuth
- Email confirmation flow with auto-redirect
- Forgot/reset password with secure token flow
- Guest routes (redirect logged-in users away from login/register)
- Protected routes (redirect unauthenticated users to login)
- Redirect-after-login via `?redirect=` search param

## Architecture

### Feature-Based Organization

Code is organized by feature, not by type. Each feature folder is self-contained:

```
src/features/
├── auth/       # AuthContext, login, register, forgot/reset, route guards
├── bookings/   # Availability calendar, booking hooks, status badge
├── landing/    # Marketing page sections (hero, FAQ, testimonials)
├── listings/   # Listing CRUD, image gallery, filters, search
├── messages/   # Real-time chat, inbox, unread counts, contact owner
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

Layouts wrap pages and compose the app shell:

- **AppLayout** — global header + footer, used by all standard pages
- **PublicLayout** — minimal layout for auth pages (login, register)
- **AuthLayout** — centered card layout for auth forms
- **DashboardLayout** — sidebar + main area for dashboard pages
- **DashboardShell** — lazy-loading route shell for dashboard tabs
- **ListingLayout** — listing detail page layout
- **MobileNav** — bottom navigation bar for mobile dashboard

### Data Flow

1. **Supabase** is the single source of truth (auth, database, storage)
2. **React Context** providers (AuthContext, ProfileContext, ThemeContext, ToastContext) are composed in `main.jsx` and provide global state
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
│   ├── messages/           # Real-time chat, inbox, contact owner
│   │   ├── hooks/
│   │   └── components/
│   ├── profile/            # ProfileContext, form, avatar, completion overlay
│   │   ├── context/
│   │   ├── hooks/
│   │   └── components/
│   └── reviews/            # Reviews section, form, eligibility check
│       ├── hooks/
│       └── components/
├── shared/                 # Cross-feature code
│   ├── components/         # AnimatedList, ConfirmDialog, BackToTop, EmptyState, etc.
│   ├── contexts/           # ThemeContext, ToastContext
│   ├── hooks/              # useCurrentLocation
│   └── lib/                # Supabase client, constants, Zod validations
├── components/             # App-level components
│   ├── dashboard/          # Dashboard tab components
│   └── layout/             # Header, Footer, Layout shell, menus
├── layouts/                # Page layout components
├── pages/                  # Top-level routed pages
│   └── dashboard/          # Dashboard sub-pages (lazy-loaded)
├── design/                 # Design system primitives
├── utils/                  # avatar, imageCompression, location, storage
├── hooks/                  # (co-located with features, not global)
├── App.jsx                 # Route definitions
├── main.jsx                # Entry point — provider composition
└── index.css               # Tailwind v4 theme + design tokens
```

## Database Schema

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
| reviewer_id | uuid | References `profiles.id` |
| owner_id | uuid | References `profiles.id` (owner of listing) |
| rating | smallint | 1–5 |
| content | text | Review text |
| created_at | timestamptz | Auto-set |

### `messages`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | Primary key |
| booking_id | uuid | References `bookings.id` |
| sender_id | uuid | References `profiles.id` |
| content | text | Message body |
| is_read | boolean | Read status |
| created_at | timestamptz | Auto-set |

## RLS Policies

- **listings**: Public read, owner-only write
- **bookings**: Renters can view their own; owners can view bookings on their listings; renters can insert with their own ID; either party can update
- **profiles**: Public read, owner-only write
- **availability**: Owner-only management (insert/update/delete)
- **reviews**: Public read, reviewer insert with own ID
- **messages**: Read if user is participant, insert as self, update `is_read` if recipient

## Documentation Conventions

Each file includes a header comment documenting purpose, route (if applicable), responsibilities, dependencies, and notes. Custom hooks document inputs, outputs, and side effects. Design system components document variants, usage, and accessibility.

<!-- Remove /src subdirectory READMEs if they become stale; they describe their directory's architecture -->
