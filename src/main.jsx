import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ProfileProvider } from './contexts/ProfileContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ProfileProvider>
              <App />
            </ProfileProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)