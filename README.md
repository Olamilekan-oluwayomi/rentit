# RentIt

A peer-to-peer rental marketplace where users can list items for rent and browse available rentals in their area.

## Tech Stack

- **Frontend**: React 19, React Router v7, Tailwind CSS v4
- **Backend**: Supabase (auth, database, storage)
- **Forms**: react-hook-form + Zod validation
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

### Listings
- Browse all available listings with search, category, price, and location filters
- Sort by newest, oldest, or price
- Paginated results (12 per page)
- Create, edit, and manage your own listings with multi-image upload (up to 5 images)
- Category support: Tools, Cameras & Photography, Sports & Outdoors, Electronics, Musical Instruments, Party & Events, Vehicles, Gaming, Other

### Booking System
- Request to book any available listing with date range selection
- Availability calendar that blocks already-booked and owner-blocked dates
- Duplicate booking detection
- Owner can approve or decline incoming requests
- Booking statuses: Pending, Approved, Declined, Completed, Cancelled

### Dashboard
- **My Listings** — view your listed items with pending request counts
- **My Rentals** — track all your outgoing booking requests
- **Requests** — manage incoming booking requests on your listings
- **Rented Out** — view approved and completed rentals with earnings stats

### Profile
- Edit your name, bio, and location
- Auto-detect current location
- Avatar support with initials fallback

### Auth
- Email/password registration and login
- Email confirmation flow
- Forgot/reset password
- Guest routes (redirect logged-in users away from login/register)
- Protected routes (redirect unauthenticated users to login)

## Project Structure

```
src/
├── features/
│   ├── auth/              # AuthContext, route guards, login/register pages
│   ├── bookings/          # Booking hooks and components (calendar, status badge)
│   ├── listings/          # Listing hooks, form, gallery, filters, detail page
│   └── profile/           # ProfileContext, profile form and display components
├── shared/
│   ├── components/        # Reusable UI (ConfirmDialog, EmptyState, BookingMeta, etc.)
│   ├── contexts/          # ThemeContext, ToastContext
│   ├── hooks/             # useCurrentLocation
│   └── lib/               # Supabase client, constants, Zod validations
├── components/
│   ├── dashboard/         # DashboardPage and tab components
│   └── layout/            # Header, Footer, Layout, MobileMenu, UserMenu
├── pages/                 # HomePage, ProfilePage, NotFoundPage
├── utils/                 # Storage helpers, avatar utils, location utils
├── App.jsx                # Route definitions
├── main.jsx               # App entry point
├── index.css              # Tailwind v4 theme tokens
└── App.css                # Global styles
```

## Database Schema

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | References `auth.users.id` |
| full_name | text | Display name |
| avatar_url | text | Storage path to avatar |
| bio | text | User bio |
| location | text | User location |

### `listings`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| owner_id | uuid | References `profiles.id` |
| title | text | Listing title |
| description | text | Listing description |
| category | text | One of the defined categories |
| daily_price | number | Price per day |
| location | text | Listing location |
| images | text[] | Storage paths to images |
| is_active | boolean | Whether listing is published |

### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| listing_id | uuid | References `listings.id` |
| renter_id | uuid | References `profiles.id` |
| start_date | date | Rental start date |
| end_date | date | Rental end date |
| total_price | number | Computed total |
| status | text | pending / approved / declined / completed / cancelled |
| owner_message | text | Optional message from owner |
| created_at | timestamp | Auto-set on creation |
| updated_at | timestamp | Auto-set on update |

### `availability`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| listing_id | uuid | References `listings.id` |
| is_blocked | boolean | Whether the date is unavailable |
| date | date | The blocked date |

## RLS Policies

- **Listings**: Public read, owner-only write
- **Bookings**: Renters can view their own; owners can view bookings on their listings; renters can insert with their own ID; either party can update
- **Profiles**: Public read, owner-only write
- **Availability**: Owner-only management
