/**
 * App — Root component that defines all client-side routes.
 *
 * Every page is wrapped in the Layout shell (Header + Footer).
 * Auth-sensitive routes use ProtectedRoute or GuestRoute guards:
 *   - GuestRoute: /login, /register, /forgot-password (redirects logged-in users home).
 *   - ProtectedRoute: /profile, /listings/new, /listings/:id/edit, /dashboard (redirects guests to /login).
 *   - Public: /, /listings/:id, /confirm, /reset-password (accessible to everyone).
 */

import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoginPage from './features/auth/components/LoginPage'
import RegisterPage from './features/auth/components/RegisterPage'
import EmailConfirmationPage from './features/auth/components/EmailConfirmationPage'
import ForgotPasswordPage from './features/auth/components/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/components/ResetPasswordPage'
import HomePage from './pages/HomePage'
import NewListingPage from './features/listings/components/NewListingPage'
import ListingDetailPage from './features/listings/components/ListingDetailPage'
import EditListingPage from './features/listings/components/EditListingPage'
import ProfilePage from './features/profile/components/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import GuestRoute from './features/auth/components/GuestRoute'

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
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/listings/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
        <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
      </Routes>
    </Layout>
  )
}

export default App
