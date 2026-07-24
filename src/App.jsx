/**
 * App — Root component that defines all client-side routes.
 *
 * Every page is wrapped in the Layout shell (Header + Footer).
 * Auth-sensitive routes use ProtectedRoute or GuestRoute guards:
 *   - GuestRoute: /login, /register, /forgot-password (redirects logged-in users home).
 *   - ProtectedRoute: /profile, /listings/new, /listings/:id/edit, /requests, /my-bookings (redirects guests to /login).
 *   - Public: /, /listings/:id, /confirm, /reset-password (accessible to everyone).
 */

import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmailConfirmationPage from './pages/EmailConfirmationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import HomePage from './pages/HomePage'
import NewListingPage from './pages/NewListingPage'
import ListingDetailPage from './pages/ListingDetailPage'
import EditListingPage from './pages/EditListingPage'
import ProfilePage from './pages/ProfilePage'
import BookingRequestsPage from './pages/BookingRequestsPage'
import MyBookingsPage from './pages/MyBookingsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import GuestRoute from './components/common/GuestRoute'

/**
 * @returns {JSX.Element} The full route tree wrapped in the site layout.
 */
function App() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/confirm" element={<EmailConfirmationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />

        {/* Guest-only routes — logged-in users are redirected home */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

        {/* Authenticated-only routes — guests are redirected to /login */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/listings/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
        <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><BookingRequestsPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
      </Routes>
    </Layout>
  )
}

export default App
