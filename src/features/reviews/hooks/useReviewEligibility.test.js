/*
 * useReviewEligibility — Tests the rules that decide whether the current user
 * may leave or edit a review for a given booking.
 *
 * A review is only allowed once the booking was approved (or completed) AND
 * the rental period has ended. An existing review for the booking flips the
 * result from "can leave" to "can edit".
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const mockUser = { id: 'user-1' }

vi.mock('../../auth/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))

vi.mock('../../../shared/lib/supabase')

import { supabase } from '../../../shared/lib/supabase'
import { useReviewEligibility } from './useReviewEligibility'

const ended = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // yesterday
const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // tomorrow

const approvedAndEnded = { id: 'b1', status: 'completed', end_date: ended }
const approvedNotEnded = { id: 'b2', status: 'approved', end_date: future }
const pendingAndEnded = { id: 'b3', status: 'pending', end_date: ended }
const cancelledAndEnded = { id: 'b4', status: 'cancelled', end_date: ended }

beforeEach(() => {
  supabase.__reset()
})

describe('useReviewEligibility — ineligible bookings', () => {
  it('does not query when the booking is not approved', async () => {
    const { result } = renderHook(() =>
      useReviewEligibility({ booking: pendingAndEnded })
    )

    await waitFor(() => expect(result.current.eligibility.eligible).toBe(false))
    expect(result.current.eligibility.canLeave).toBe(false)
    expect(result.current.eligibility.canEdit).toBe(false)
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('does not query when the booking was cancelled', async () => {
    const { result } = renderHook(() =>
      useReviewEligibility({ booking: cancelledAndEnded })
    )

    await waitFor(() => expect(result.current.eligibility.eligible).toBe(false))
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('does not query before the rental period has ended', async () => {
    const { result } = renderHook(() =>
      useReviewEligibility({ booking: approvedNotEnded })
    )

    await waitFor(() => expect(result.current.eligibility.eligible).toBe(false))
    expect(result.current.eligibility.canLeave).toBe(false)
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('handles a missing booking', async () => {
    const { result } = renderHook(() => useReviewEligibility({ booking: null }))

    await waitFor(() => expect(result.current.eligibility.eligible).toBe(false))
    expect(result.current.existingReview).toBeNull()
  })
})

describe('useReviewEligibility — eligible booking without a review', () => {
  it('allows leaving a review', async () => {
    supabase.__setMockData('reviews', { data: [], error: null })

    const { result } = renderHook(() =>
      useReviewEligibility({ booking: approvedAndEnded })
    )

    await waitFor(() => expect(result.current.eligibility.eligible).toBe(true))
    expect(result.current.eligibility.canLeave).toBe(true)
    expect(result.current.eligibility.canEdit).toBe(false)
    expect(result.current.existingReview).toBeNull()
  })

  it('scopes the existing-review lookup to this booking and reviewer', async () => {
    supabase.__setMockData('reviews', { data: [], error: null })

    renderHook(() => useReviewEligibility({ booking: approvedAndEnded }))

    await waitFor(() => expect(supabase.from).toHaveBeenCalledWith('reviews'))
    const chain = supabase.__lastChain()
    expect(chain.eq).toHaveBeenCalledWith('booking_id', 'b1')
    expect(chain.eq).toHaveBeenCalledWith('reviewer_id', 'user-1')
  })
})

describe('useReviewEligibility — eligible booking with an existing review', () => {
  it('allows editing instead of leaving a second review', async () => {
    const review = { id: 'r1', booking_id: 'b1', reviewer_id: 'user-1', rating: 5, comment: 'Great' }
    supabase.__setMockData('reviews', { data: [review], error: null })

    const { result } = renderHook(() =>
      useReviewEligibility({ booking: approvedAndEnded })
    )

    await waitFor(() => expect(result.current.eligibility.canEdit).toBe(true))
    expect(result.current.eligibility.eligible).toBe(true)
    expect(result.current.eligibility.canLeave).toBe(false)
    expect(result.current.existingReview).toEqual(review)
  })
})