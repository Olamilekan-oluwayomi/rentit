/*
 * useAvailability — Tests that blocked ranges are fetched correctly
 * and that loading/error states are surfaced to the caller.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('../../../shared/lib/supabase')

import { supabase } from '../../../shared/lib/supabase'
import { useAvailability } from './useAvailability'

beforeEach(() => {
  supabase.__reset()
})

describe('useAvailability', () => {
  it('returns blocked ranges when the query succeeds', async () => {
    const ranges = [
      { id: 'r1', start_date: '2026-08-01', end_date: '2026-08-05', is_blocked: true },
      { id: 'r2', start_date: '2026-08-10', end_date: '2026-08-12', is_blocked: true },
    ]
    supabase.__setMockData('availability', { data: ranges, error: null })

    const { result } = renderHook(() => useAvailability('listing-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.blockedRanges).toEqual(ranges)
    expect(result.current.error).toBeNull()
  })

  it('returns an empty array when there are no blocked ranges', async () => {
    supabase.__setMockData('availability', { data: [], error: null })

    const { result } = renderHook(() => useAvailability('listing-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.blockedRanges).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('surfaces the error message when the query fails', async () => {
    supabase.__setMockData('availability', { data: null, error: { message: 'Network error' } })

    const { result } = renderHook(() => useAvailability('listing-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.blockedRanges).toEqual([])
    expect(result.current.error).toBe('Network error')
  })

  it('starts in loading state and transitions to not loading', async () => {
    supabase.__setMockData('availability', { data: [], error: null })

    const { result } = renderHook(() => useAvailability('listing-1'))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('does not query when listingId is null', async () => {
    const { result } = renderHook(() => useAvailability(null))

    await waitFor(() => expect(result.current.loading).toBe(true))
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('calls supabase with correct parameters', async () => {
    supabase.__setMockData('availability', { data: [], error: null })

    renderHook(() => useAvailability('listing-1'))
    await vi.waitFor(() => expect(supabase.from).toHaveBeenCalledWith('availability'))

    const chain = supabase.__lastChain()
    expect(chain.select).toHaveBeenCalledWith('*')
    expect(chain.eq).toHaveBeenCalledWith('listing_id', 'listing-1')
    expect(chain.eq).toHaveBeenCalledWith('is_blocked', true)
    expect(chain.order).toHaveBeenCalledWith('start_date', { ascending: true })
  })

  it('refetch increments the refreshKey and re-queries', async () => {
    supabase.__setMockData('availability', { data: [], error: null })

    const { result } = renderHook(() => useAvailability('listing-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.__reset()
    supabase.__setMockData('availability', { data: [{ id: 'r1' }], error: null })

    result.current.refetch()
    await waitFor(() => expect(result.current.blockedRanges).toHaveLength(1))
  })
})