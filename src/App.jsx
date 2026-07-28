/**
 * App — Root component that defines all client-side routes.
 *
 * Routes are split into two layout groups:
 *   - PublicLayout: unauthenticated pages (landing, login, register, etc.)
 *     Does NOT load profile-completion logic.
 *   - AppLayout: authenticated pages (profile, listings, inbox, etc.)
 *     Loads ProfileCompletionOverlay.
 *   - Dashboard: lazy-loaded DashboardShell with its own chrome.
 *
 * Auth-sensitive routes use ProtectedRoute or GuestRoute guards:
 *   - GuestRoute: /login, /register, /forgot-password (redirects logged-in users home).
 *   - ProtectedRoute: /profile, /listings/new, /listings/:id/edit, /dashboard (redirects guests to /login).
 *   - Public: /, /listings/:id, /confirm, /reset-password (accessible to everyone).
 */

import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './features/auth/context/AuthContext'
import { FavoritesProvider } from './features/favorites/hooks/useFavorites'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import GuestRoute from './features/auth/components/GuestRoute'
import ScrollToTop from './shared/components/ScrollToTop'

const LoginPage = lazy(() => import('./features/auth/components/LoginPage'))
const RegisterPage = lazy(() => import('./features/auth/components/RegisterPage'))
const EmailConfirmationPage = lazy(() => import('./features/auth/components/EmailConfirmationPage'))
const ForgotPasswordPage = lazy(() => import('./features/auth/components/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./features/auth/components/ResetPasswordPage'))
import LandingPage from "./pages/LandingPage";
const HomePage = lazy(() => import('./pages/HomePage'))
const NewListingPage = lazy(() => import('./features/listings/components/NewListingPage'))
const ListingDetailPage = lazy(() => import('./features/listings/components/ListingDetailPage'))
const EditListingPage = lazy(() => import('./features/listings/components/EditListingPage'))
const ProfilePage = lazy(() => import('./features/profile/components/ProfilePage'))
const BookingChatPage = lazy(() => import('./pages/BookingChatPage'))
const InboxPage = lazy(() => import('./pages/InboxPage'))
const FavoritesPage = lazy(() => import('./features/favorites/components/FavoritesPage'))

const DashboardShell = lazy(() => import('./layouts/DashboardShell'))
const DashboardHome = lazy(() => import('./pages/dashboard/Home'))
const DashboardAnalytics = lazy(() => import('./pages/dashboard/Analytics'))
const DashboardListings = lazy(() => import('./pages/dashboard/Listings'))
const DashboardBookings = lazy(() => import('./pages/dashboard/Bookings'))
const DashboardMessages = lazy(() => import('./pages/dashboard/Messages'))
const DashboardNotifications = lazy(() => import('./pages/dashboard/Notifications'))
const DashboardSettings = lazy(() => import('./pages/dashboard/Settings'))

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

/**
 * Returns the component to render at the root "/" route based on auth state.
 *
 * LandingPage is the default and renders immediately, it is never blocked
 * behind the auth session check. This matters for performance: LandingPage
 * is eagerly bundled (see import above) specifically so it can paint as
 * soon as the main JS bundle runs, without waiting on a Supabase session
 * lookup to resolve first.
 *
 * HomePage (the logged-in browse view) is only swapped in once we've
 * positively confirmed the user is logged in. A returning logged-in user
 * may see LandingPage for a brief moment on refresh before HomePage
 * mounts, that's an intentional trade-off: real content immediately is
 * better for perceived performance than a blocking spinner.
 */
function RootRoute() {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return <LandingPage />
  }

  return <HomePage />
}

function App() {
  return (
    <FavoritesProvider>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* ── Public routes — no profile logic loaded ─────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<RootRoute />} />
            <Route path="/confirm" element={<EmailConfirmationPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          </Route>

          {/* ── Authenticated routes — with profile overlay ─────── */}
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/listings/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
            <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
            <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/booking/:id" element={<ProtectedRoute><BookingChatPage /></ProtectedRoute>} />
          </Route>

          {/* ── Dashboard — lazy-loaded shell with its own chrome ─ */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardShell /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="analytics" element={<DashboardAnalytics />} />
            <Route path="listings" element={<DashboardListings />} />
            <Route path="bookings" element={<DashboardBookings />} />
            <Route path="messages" element={<DashboardMessages />} />
            <Route path="notifications" element={<DashboardNotifications />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </FavoritesProvider>
  )
}

export default App
