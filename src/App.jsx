/**
 * App — Root component that defines all client-side routes.
 *
 * Routes are split into three groups:
 *   - PublicLayout: public pages with Navbar + Footer (landing, marketing,
 *     listing detail, public profiles, and the catch-all 404).
 *     Does NOT load profile-completion logic.
 *   - Auth routes: declared at the top level, outside PublicLayout, because
 *     each page renders AuthLayout itself — which is a complete chrome-free
 *     page including its own theme toggle. Nesting them under PublicLayout
 *     produced a duplicate Navbar, Footer, and logo.
 *   - AppLayout: authenticated pages (profile, listings, inbox, etc.)
 *     Loads ProfileCompletionOverlay.
 *   - Dashboard: lazy-loaded DashboardShell with its own chrome.
 *
 * Auth-sensitive routes use ProtectedRoute or GuestRoute guards:
 *   - GuestRoute: /login, /register, /forgot-password (redirects logged-in users home).
 *   - ProtectedRoute: /profile, /listings/new, /listings/:id/edit, /inbox,
 *     /favorites, /booking/:id, /dashboard (redirects guests to /login).
 *   - Public: /, /listings/:id, /confirm, /reset-password (accessible to everyone).
 *   - path="*" is a catch-all NotFoundPage. It is declared inside the
 *     PublicLayout group but is not the last route in the file; React Router
 *     ranks "*" lowest regardless of declaration order, so later groups never
 *     shadow it.
 */

import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
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
const PublicProfilePage = lazy(() => import('./features/profile/components/PublicProfilePage'))
const BookingChatPage = lazy(() => import('./pages/BookingChatPage'))
const InboxPage = lazy(() => import('./pages/InboxPage'))
const FavoritesPage = lazy(() => import('./features/favorites/components/FavoritesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

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
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/users/:userId" element={<PublicProfilePage />} />

            {/* ── Catch-all: React Router ranks "*" lowest, so declaration
                order does not matter and later groups never shadow it ── */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* ── Auth routes — no site chrome ─────────────────────────
              Intentionally outside the PublicLayout group. Each of these pages
              renders AuthLayout itself, which is a complete page: putting them
              under PublicLayout as well produced a second Navbar and Footer
              around it, plus a duplicate logo and a min-h-screen block nested
              inside another one. AuthLayout carries its own theme toggle. */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/confirm" element={<EmailConfirmationPage />} />

          {/* ── Authenticated routes — with profile overlay ─────── */}
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/listings/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
            <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
            <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/booking/:id" element={<ProtectedRoute><BookingChatPage /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
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
