/*
 * RegisterFlow — Integration test covering the full registration flow:
 * navigate to /register, fill the form, submit, see the confirmation screen,
 * then follow the "Back to login" link to the login page.
 *
 * Mocks supabase at the network boundary so no external calls are made.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const mockSignUp = vi.fn()
const mockSignIn = vi.fn()

vi.mock('../../features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    signIn: mockSignIn,
    user: null,
    loading: false,
  }),
}))

vi.mock('../../shared/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}))

import LoginPage from '../../features/auth/components/LoginPage'
import RegisterPage from '../../features/auth/components/RegisterPage'

beforeEach(() => {
  vi.clearAllMocks()
  mockSignUp.mockResolvedValue({ error: null })
})

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Registration flow', () => {
  it('starts on the register page with the form visible', () => {
    renderApp()
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
  })

  it('fills the form, submits, and shows the confirmation screen', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.type(screen.getByLabelText(/full name/i), 'Alice')
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'secret123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/alice@example\.com/)).toBeInTheDocument()
    expect(mockSignUp).toHaveBeenCalledTimes(1)
  })

  it('navigates to the login page when "Back to login" is clicked', async () => {
    const user = userEvent.setup()
    renderApp()

    // Submit the form to get to confirmation
    await user.type(screen.getByLabelText(/full name/i), 'Alice')
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'secret123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })

    // Click "Back to login"
    await user.click(screen.getByText(/back to login/i))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    })
  })

  it('shows an error and stays on register page when signup fails', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Email already registered' } })

    const user = userEvent.setup()
    renderApp()

    await user.type(screen.getByLabelText(/full name/i), 'Alice')
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'secret123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
    })
    // Still on the register page
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
  })
})