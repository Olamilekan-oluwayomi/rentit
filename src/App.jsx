/**
 * App — Root component that defines all client-side routes.
 *
 * Every page is wrapped in the Layout shell (Header + Footer).
 * Auth-sensitive routes use ProtectedRoute or GuestRoute guards:
 *   - GuestRoute: /login, /register, /forgot-password (redirects logged-in users home).
 *   - ProtectedRoute: /profile, /listings/new, /listings/:id/edit, /dashboard (redirects guests to /login).
 *   - Public: /, /listings/:id, /confirm, /reset-password (accessible to everyone).
 */

import { lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useAuth } from './features/auth/context/AuthContext'
import { AppLayout, DashboardLayout } from './layouts'
import LoginPage from './features/auth/components/LoginPage'
import RegisterPage from './features/auth/components/RegisterPage'
import EmailConfirmationPage from './features/auth/components/EmailConfirmationPage'
import ForgotPasswordPage from './features/auth/components/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/components/ResetPasswordPage'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import NewListingPage from './features/listings/components/NewListingPage'
import ListingDetailPage from './features/listings/components/ListingDetailPage'
import EditListingPage from './features/listings/components/EditListingPage'
import ProfilePage from './features/profile/components/ProfilePage'
import BookingChatPage from './pages/BookingChatPage'
import InboxPage from './pages/InboxPage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import GuestRoute from './features/auth/components/GuestRoute'
import ScrollToTop from './shared/components/ScrollToTop'

const DashboardHome = lazy(() => import('./pages/dashboard/Home'))
const DashboardAnalytics = lazy(() => import('./pages/dashboard/Analytics'))
const DashboardListings = lazy(() => import('./pages/dashboard/Listings'))
const DashboardBookings = lazy(() => import('./pages/dashboard/Bookings'))
const DashboardMessages = lazy(() => import('./pages/dashboard/Messages'))
const DashboardNotifications = lazy(() => import('./pages/dashboard/Notifications'))
const DashboardSettings = lazy(() => import('./pages/dashboard/Settings'))

/**
 * Returns the component to render at the root "/" route based on auth state.
 * - Loading: spinner (avoids flash redirect).
 * - Logged out: LandingPage (marketing page).
 * - Logged in: HomePage (browse listings).
 */
function RootRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return user ? <HomePage /> : <LandingPage />
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
          <Routes location={location}>
            <Route path="/" element={<RootRoute />} />
            <Route path="/confirm" element={<EmailConfirmationPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
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
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  )
}

export default App
