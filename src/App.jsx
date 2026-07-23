import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmailConfirmationPage from './pages/EmailConfirmationPage'
import NewListingPage from './pages/NewListingPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>RentIt Home (placeholder)</h1>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/confirm" element={<EmailConfirmationPage />} />
      <Route path="/listings/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
    </Routes>
  )
}

export default App