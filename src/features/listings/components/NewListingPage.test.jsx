/*
 * NewListingPage — Tests that form validation blocks invalid submissions
 * and that a valid submission triggers the listing insert flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mockUser = { id: 'user-1' }
const mockAddToast = vi.fn()
const mockNavigate = vi.fn()
const mockRequireProfile = vi.fn((fn) => fn())

vi.mock('../../auth/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))

vi.mock('../../../shared/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}))

vi.mock('../../profile/hooks/useRequireCompleteProfile', () => ({
  useRequireCompleteProfile: () => ({ requireProfile: mockRequireProfile }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../../shared/lib/supabase')

// Mock image compression so tests don't run browser APIs
vi.mock('../../../utils/imageCompression', () => ({
  compressImage: vi.fn((file) => Promise.resolve(file)),
}))

import { supabase } from '../../../shared/lib/supabase'
import NewListingPage from './NewListingPage'

beforeEach(() => {
  supabase.__reset()
  vi.clearAllMocks()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <NewListingPage />
    </MemoryRouter>,
  )
}

describe('NewListingPage', () => {
  it('renders the listing form with heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /new listing/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/daily price/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Location')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /publish listing/i })).toBeInTheDocument()
  })

  it('shows validation error when title is too short', async () => {
    const user = userEvent.setup()
    renderPage()

    // Type a short title (min is 5)
    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'AB')

    // Submit
    await user.click(screen.getByRole('button', { name: /publish listing/i }))

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 5 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when description is too short', async () => {
    const user = userEvent.setup()
    renderPage()

    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'Valid Title Here')

    const descInput = screen.getByLabelText(/description/i)
    await user.type(descInput, 'Short')

    await user.click(screen.getByRole('button', { name: /publish listing/i }))

    await waitFor(() => {
      expect(screen.getByText(/description must be at least 20 characters/i)).toBeInTheDocument()
    })
  })

  it('submits a valid listing and navigates to the new listing page', async () => {
    // Mock supabase: listing insert succeeds
    supabase.__setMockData('listings', {
      data: { id: 'new-listing-1', title: 'My Item' },
      error: null,
    })

    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/title/i), 'Professional Camera')
    await user.type(screen.getByLabelText(/description/i), 'A high quality DSLR camera in excellent condition with lens kit')
    // Select a category
    await user.selectOptions(screen.getByLabelText(/category/i), 'Cameras & Photography')
    await user.type(screen.getByLabelText(/daily price/i), '25')
    await user.type(screen.getByLabelText('Location'), 'Lagos, Nigeria')
    // Upload an image (required by validation)
    const file = new File(['dummy'], 'camera.jpg', { type: 'image/jpeg' })
    const fileInput = document.querySelector('input[type="file"]')
    await fireEvent.change(fileInput, { target: { files: [file] } })

    await user.click(screen.getByRole('button', { name: /publish listing/i }))

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('listings')
    })

    // The first from('listings') call is the insert chain
    const insertChain = supabase.from.mock.results[0].value
    expect(insertChain.insert).toHaveBeenCalled()

    // Should navigate to the new listing
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/listings/new-listing-1')
    })
  })

  it('renders category options from the constants list', () => {
    renderPage()
    const options = screen.getAllByRole('option')
    // First option is the placeholder
    expect(options[0]).toHaveValue('')
    // Expect common categories to be present
    expect(screen.getByRole('option', { name: 'Tools' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Cameras & Photography' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Electronics' })).toBeInTheDocument()
  })

  it('shows an error toast when listing insert fails', async () => {
    supabase.__setMockData('listings', {
      data: null,
      error: { message: 'Database error' },
    })

    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/title/i), 'Professional Camera')
    await user.type(screen.getByLabelText(/description/i), 'A high quality DSLR camera in excellent condition with lens kit')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Cameras & Photography')
    await user.type(screen.getByLabelText(/daily price/i), '25')
    await user.type(screen.getByLabelText('Location'), 'Lagos, Nigeria')
    // Upload an image (required by validation)
    const file = new File(['dummy'], 'camera.jpg', { type: 'image/jpeg' })
    const fileInput = document.querySelector('input[type="file"]')
    await fireEvent.change(fileInput, { target: { files: [file] } })

    await user.click(screen.getByRole('button', { name: /publish listing/i }))

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Database error', 'error')
    })
  })
})