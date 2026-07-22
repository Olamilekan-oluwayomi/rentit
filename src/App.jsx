import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmailConfirmationPage from './pages/EmailConfirmationPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>RentIt Home (placeholder)</h1>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/confirm" element={<EmailConfirmationPage />} />
    </Routes>
  )
}

export default App