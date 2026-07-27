/**
 * App — Root component that defines all client-side routes.
 *
 * Every page is wrapped in the Layout shell (Header + Footer).
 * Auth-sensitive routes use ProtectedRoute or GuestRoute guards:
 *   - GuestRoute: /login, /register, /forgot-password (redirects logged-in users home).
 *   - ProtectedRoute: /profile, /listings/new, /listings/:id/edit, /dashboard (redirects guests to /login).
 *   - Public: /, /listings/:id, /confirm, /reset-password (accessible to everyone).
 */

import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useAuth } from './features/auth/context/AuthContext'
import { AppLayout, DashboardShell } from './layouts'
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
 * lookup to resolve first. Blocking it behind `loading` reintroduced the
 * exact render-delay problem that moving it to an eager import was meant
 * to fix, since the hero would still wait on an unrelated async check.
 *
 * HomePage (the logged-in browse view) is only swapped in once we've
 * positively confirmed the user is logged in. A returning logged-in user
 * may see LandingPage for a brief moment on refresh before HomePage
 * mounts, that's an intentional trade-off: real content immediately is
 * better for perceived performance than a blocking spinner, even though
 * it means a short flash for that specific case.
 */
function RootRoute() {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return <LandingPage />
  }

  return <HomePage />
}

/**
 * @returns {JSX.Element} The full route tree wrapped in the site layout.
 */
function App() {
  const location = useLocation()
  const prefersReduced = useReducedMotion()

  return (
    <AppLayout>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="h-full"
          initial={prefersReduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? {} : { opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          <Suspense fallback={<PageFallback />}>
            <Routes location={location}>
              <Route path="/" element={<RootRoute />} />
              <Route path="/confirm" element={<EmailConfirmationPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/listings/:id" element={<ListingDetailPage />} />
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
              <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardShell /></ProtectedRoute>}>
                <Route index element={<DashboardHome />} />
                <Route path="analytics" element={<DashboardAnalytics />} />
                <Route path="listings" element={<DashboardListings />} />
                <Route path="bookings" element={<DashboardBookings />} />
                <Route path="messages" element={<DashboardMessages />} />
                <Route path="notifications" element={<DashboardNotifications />} />
                <Route path="settings" element={<DashboardSettings />} />
              </Route>
              <Route path="/listings/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
              <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
              <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
              <Route path="/booking/:id" element={<ProtectedRoute><BookingChatPage /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  )
}

export default App