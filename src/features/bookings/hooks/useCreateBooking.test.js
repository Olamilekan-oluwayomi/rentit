/*
 * useCreateBooking — Tests the booking submission flow including the
 * race-condition defense that re-checks availability before inserting.
 *
 * Why this matters: The re-validation step runs between the calendar view
 * and the DB insert. If a blocked range appeared after the calendar loaded,
 * the hook must reject the booking BEFORE touching the bookings table.
 * This test verifies that overlap rejection sets { error } and never calls
 * supabase.from('bookings').insert.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockUser = { id: 'user-1', email: 'renter@test.com' }
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

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../../shared/lib/supabase')

import { supabase } from '../../../shared/lib/supabase'
import { useCreateBooking } from './useCreateBooking'

beforeEach(() => {
  supabase.__reset()
  vi.clearAllMocks()
})

describe('useCreateBooking', () => {
  const listingId = 'listing-1'
  const startDate = new Date('2026-08-10')
  const endDate = new Date('2026-08-12')
  const totalPrice = 150

  it('inserts a booking when the date range is clear', async () => {
    // Availability re-check returns no blocked ranges
    supabase.__setMockData('availability', { data: [], error: null })
    // Booking insert succeeds
    supabase.__setMockData('bookings', {
      data: { id: 'b-1', listing_id: listingId, status: 'pending' },
      error: null,
    })

    const { result } = renderHook(() => useCreateBooking())

    let outcome
    await act(async () => {
      outcome = await result.current.createBooking(listingId, startDate, endDate, totalPrice)
    })

    expect(outcome.success).toBe(true)
    expect(outcome.booking).toBeDefined()
    // The insert chain must have been invoked
    const chain = supabase.__lastChain()
    expect(chain).not.toBeNull()
    expect(chain.insert).toHaveBeenCalled()
  })

  it('rejects the booking when the date range overlaps a blocked range and never inserts', async () => {
    // Availability re-check returns a range overlapping our proposed dates
    supabase.__setMockData('availability', {
      data: [
        {
          id: 'b-1',
          start_date: '2026-08-09',
          end_date: '2026-08-11',
          is_blocked: true,
        },
      ],
      error: null,
    })
    // Set bookings mock so the test can assert insert was NEVER called
    supabase.__setMockData('bookings', { data: null, error: null })

    const { result } = renderHook(() => useCreateBooking())

    let outcome
    await act(async () => {
      outcome = await result.current.createBooking(listingId, startDate, endDate, totalPrice)
    })

    // Must be rejected
    expect(outcome.success).toBeUndefined()
    expect(outcome.error).toBe('Date range overlaps a blocked range')

    // Must NOT have called bookings.insert
    // Check that the chain created by supabase.from('bookings') never had insert called
    // To verify this, we check that supabase.from was never called with 'bookings'
    const bookingsCalls = supabase.from.mock.calls.filter(([t]) => t === 'bookings')
    expect(bookingsCalls).toHaveLength(0)

    // An error toast must have been fired
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.stringContaining('no longer available'),
      'error',
    )
  })

  it('rejects when the availability re-check itself fails', async () => {
    supabase.__setMockData('availability', { data: null, error: { message: 'DB timeout' } })

    const { result } = renderHook(() => useCreateBooking())

    let outcome
    await act(async () => {
      outcome = await result.current.createBooking(listingId, startDate, endDate, totalPrice)
    })

    expect(outcome.error).toBe('DB timeout')
    expect(mockAddToast).toHaveBeenCalledWith(
      'Failed to verify availability. Please try again.',
      'error',
    )
  })

  it('toggles submitting state around the request', async () => {
    supabase.__setMockData('availability', { data: [], error: null })
    supabase.__setMockData('bookings', { data: { id: 'b-1' }, error: null })

    const { result } = renderHook(() => useCreateBooking())
    expect(result.current.submitting).toBe(false)

    let createPromise
    act(() => {
      createPromise = result.current.createBooking(listingId, startDate, endDate, totalPrice)
    })

    // submitting is true while the request is in flight (setSubmitting(true) is synchronous)
    expect(result.current.submitting).toBe(true)

    await act(async () => {
      await createPromise
    })

    expect(result.current.submitting).toBe(false)
  })

  it('calls supabase.from("bookings").insert with correct fields on a clear range', async () => {
    supabase.__setMockData('availability', { data: [], error: null })
    supabase.__setMockData('bookings', {
      data: { id: 'b-1', listing_id: listingId, status: 'pending' },
      error: null,
    })

    const { result } = renderHook(() => useCreateBooking())
    await act(async () => {
      await result.current.createBooking(listingId, startDate, endDate, totalPrice)
    })

    // Find the booking chain
    const bookingCalls = supabase.from.mock.results.filter(
      (r) => r.value.__table === 'bookings',
    )
    expect(bookingCalls.length).toBeGreaterThanOrEqual(1)
    const bookingChain = bookingCalls[0].value
    expect(bookingChain.insert).toHaveBeenCalledWith({
      listing_id: listingId,
      renter_id: mockUser.id,
      start_date: '2026-08-10',
      end_date: '2026-08-12',
      total_price: totalPrice,
      status: 'pending',
    })
  })
})