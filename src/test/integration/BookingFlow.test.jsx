/*
 * BookingFlow — Integration test covering the listing detail page booking
 * flow for a logged-in non-owner. Verifies the booking card renders with
 * pricing and the calendar component is mounted.
 *
 * Mocks supabase for listing data and availability so no external calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// ── Mock all the dependencies ListingDetailPage needs ─────────────

const mockUser = { id: 'user-2', email: 'renter@test.com' }

vi.mock('../../features/auth/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, loading: false }),
}))

vi.mock('../../shared/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}))

// Profile context needed for useCreateBooking → useRequireCompleteProfile
vi.mock('../../features/profile/hooks/useRequireCompleteProfile', () => ({
  useRequireCompleteProfile: () => ({
    requireProfile: vi.fn((fn) => fn()),
    isProfileComplete: true,
  }),
}))

vi.mock('../../features/favorites/hooks/useFavorites', () => ({
  useFavorites: () => ({
    isFavorited: () => false,
    toggleFavorite: vi.fn(),
  }),
}))

vi.mock('../../features/bookings/hooks/useCreateBooking', () => ({
  useCreateBooking: () => ({
    createBooking: vi.fn(),
    submitting: false,
  }),
}))

vi.mock('../../shared/lib/supabase')

import { supabase } from '../../shared/lib/supabase'

// Mock storage utility
vi.mock('../../utils/storage', () => ({
  getListingImageUrl: () => '/mock-image.jpg',
  getAvatarUrl: () => 'https://placeholder.test/avatar.png',
}))

import ListingDetailPage from '../../features/listings/components/ListingDetailPage'

beforeEach(() => {
  vi.clearAllMocks()
})

function renderListingDetail() {
  return render(
    <MemoryRouter initialEntries={['/listings/listing-1']}>
      <Routes>
        <Route path="/listings/:id" element={<ListingDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Listing detail page — booking flow', () => {
  it('shows a loading skeleton while the listing loads', () => {
    // Don't set up any mock data — it will be in loading state
    renderListingDetail()
    // Look for the animated pulse skeleton divs
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders the listing detail once data loads', async () => {
    // We need to mock the useListing hook since it's internal
    // or mock the supabase queries it makes
    // For this integration test, we rely on the actual hook behavior
    // with mocked supabase

    // The listing detail page fetches the listing via useListing(id)
    // which calls supabase.from('listings').select(...).eq('id', id).single()
    // Mock that data
    supabase.__setMockData('listings', {
      data: {
        id: 'listing-1',
        title: 'Professional Camera',
        description: 'A great camera for rent',
        category: 'Cameras & Photography',
        daily_price: 50,
        location: 'Lagos',
        owner_id: 'owner-1',
        images: ['img1.jpg'],
        is_active: true,
        created_at: '2026-07-01T00:00:00Z',
        owner: {
          id: 'owner-1',
          full_name: 'Bob Owner',
          avatar_url: null,
          average_rating: 4.5,
          rating_count: 10,
        },
      },
      error: null,
    })

    renderListingDetail()

    await waitFor(() => {
      expect(screen.getByText(/professional camera/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/great camera for rent/i)).toBeInTheDocument()
    expect(screen.getByText(/lagos/i)).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: /check availability/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/hosted by/i)).toBeInTheDocument()
    expect(screen.getAllByText(/bob owner/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders the booking card with daily price', async () => {
    supabase.__setMockData('listings', {
      data: {
        id: 'listing-1',
        title: 'Camera',
        description: 'A camera.',
        category: 'Cameras & Photography',
        daily_price: 75,
        location: 'Lagos',
        owner_id: 'owner-1',
        images: [],
        is_active: true,
        created_at: '2026-07-01T00:00:00Z',
        owner: { id: 'owner-1', full_name: 'Bob', avatar_url: null, average_rating: 0, rating_count: 0 },
      },
      error: null,
    })

    renderListingDetail()

    await waitFor(() => {
      expect(screen.getAllByText(/\$75/).length).toBeGreaterThanOrEqual(1)
    })

    expect(screen.getAllByText(/\/ day/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/select a start and end date/i).length).toBeGreaterThanOrEqual(1)
  })

  it('shows the not-found state when the listing does not exist', async () => {
    supabase.__setMockData('listings', {
      data: null,
      error: { message: 'Not found', code: 'PGRST116' },
    })

    renderListingDetail()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument()
    })
    expect(screen.getByText(/back to browse/i)).toBeInTheDocument()
  })
})