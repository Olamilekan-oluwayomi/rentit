import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmailConfirmationPage from './pages/EmailConfirmationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import HomePage from './pages/HomePage'
import NewListingPage from './pages/NewListingPage'
import ListingDetailPage from './pages/ListingDetailPage'
import EditListingPage from './pages/EditListingPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import GuestRoute from './components/common/GuestRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/confirm" element={<EmailConfirmationPage />} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/listings/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
      <Route path="/listings/:id" element={<ListingDetailPage />} />
      <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
    </Routes>
  )
}

export default App