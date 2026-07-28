/*
 * RegisterPage — Tests form validation, ToS checkbox gating, and signUp
 * integration. Verifies that the submit button is disabled until the user
 * checks the ToS checkbox and that mismatched passwords prevent submission.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mockSignUp = vi.fn()

vi.mock('../../auth/context/AuthContext', () => ({
  useAuth: () => ({ signUp: mockSignUp, user: null, loading: false }),
}))

// Motion's animation primitives can be rendered in test — no mock needed.
// AuthLayout and FadeInSection render real DOM, which is fine.

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  )
}

import RegisterPage from './RegisterPage'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RegisterPage', () => {
  it('renders the create account form', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('shows the ToS checkbox and disables submit until checked', () => {
    renderPage()

    const checkbox = screen.getByRole('checkbox')
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
    expect(submitButton).toBeDisabled()

    // Check the box
    checkbox.click()
    expect(checkbox).toBeChecked()
    expect(submitButton).not.toBeDisabled()
  })

  it('displays an inline error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/full name/i), 'Alice')
    await user.type(screen.getByLabelText(/email/i), 'alice@test.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different')

    // Check ToS
    await user.click(screen.getByRole('checkbox'))
    // Submit
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    // signUp must NOT have been called
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('calls signUp with correct arguments on valid submission', async () => {
    mockSignUp.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/full name/i), 'Alice')
    await user.type(screen.getByLabelText(/email/i), 'alice@test.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'secret123')

    // Check ToS
    await user.click(screen.getByRole('checkbox'))
    // Submit
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledTimes(1)
    })

    const callArgs = mockSignUp.mock.calls[0]
    expect(callArgs[0]).toBe('alice@test.com')
    expect(callArgs[1]).toBe('secret123')
    expect(callArgs[2]).toBe('Alice')
    // Extra metadata should include terms/privacy
    expect(callArgs[3].terms_version).toBe('1.0')
    expect(callArgs[3].privacy_version).toBe('1.0')
    expect(callArgs[3].terms_accepted_at).toBeDefined()
    expect(callArgs[3].privacy_accepted_at).toBeDefined()
  })

  it('shows the check-your-email confirmation after successful signup', async () => {
    mockSignUp.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/full name/i), 'Alice')
    await user.type(screen.getByLabelText(/email/i), 'alice@test.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'secret123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/alice@test\.com/)).toBeInTheDocument()
    // The form should be gone, replaced by confirmation
    expect(screen.queryByRole('button', { name: /sign up/i })).not.toBeInTheDocument()
  })

  it('shows an inline error when signUp fails', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Email already in use' } })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/full name/i), 'Alice')
    await user.type(screen.getByLabelText(/email/i), 'alice@test.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'secret123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument()
    })
    // The form should still be visible
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('renders the ToS and Privacy links with target=_blank', () => {
    renderPage()

    const tosLink = screen.getByText(/terms of service/i)
    expect(tosLink.closest('a')).toHaveAttribute('href', '/terms')
    expect(tosLink.closest('a')).toHaveAttribute('target', '_blank')

    const privacyLink = screen.getByText(/privacy policy/i)
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy')
    expect(privacyLink.closest('a')).toHaveAttribute('target', '_blank')
  })
})