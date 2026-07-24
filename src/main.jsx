/**
 * main.jsx — Application entry point and provider composition root.
 *
 * Mounts the React app into the #root DOM element. All context providers
 * are composed here so their hooks are available app-wide:
 *
 *   - StrictMode: enables additional development-time warnings.
 *   - BrowserRouter: client-side routing.
 *   - ThemeProvider: light/dark mode state (must be outermost for CSS vars).
 *   - ToastProvider: global toast notifications.
 *   - AuthProvider: Supabase auth session and user state.
 *   - ProfileProvider: user profile data (depends on AuthProvider).
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/context/AuthContext.jsx'
import { ProfileProvider } from './features/profile/context/ProfileContext.jsx'
import { ToastProvider } from './shared/contexts/ToastContext.jsx'
import { ThemeProvider } from './shared/contexts/ThemeContext.jsx'
import App from './App.jsx'
import './index.css'

// Provider nesting order matters: ThemeProvider must wrap early so that
// theme-dependent styles apply before child providers render.
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
