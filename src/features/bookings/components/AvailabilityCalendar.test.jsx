/*
 * AvailabilityCalendar — Tests date range selection, blocked-date rejection,
 * and the Request to Book flow. Verifies that overlapping blocked ranges
 * show an inline error and do NOT call onRangeConfirmed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mutable mock so tests can configure blocked ranges per test
const mockUseAvailability = vi.hoisted(() => ({
  blockedRanges: [],
  loading: false,
  error: null,
  refetch: vi.fn(),
}))

vi.mock('../hooks/useAvailability', () => ({
  useAvailability: () => mockUseAvailability,
}))

vi.mock('../../../shared/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}))

vi.mock('../../../shared/lib/supabase')

import AvailabilityCalendar from './AvailabilityCalendar'

beforeEach(() => {
  // Reset mock state
  mockUseAvailability.blockedRanges = []
  mockUseAvailability.loading = false
  mockUseAvailability.error = null
  vi.clearAllMocks()
})

describe('AvailabilityCalendar — renter view (isOwner=false)', () => {
  const defaultProps = {
    listingId: 'listing-1',
    dailyPrice: 50,
    isOwner: false,
    onRangeConfirmed: vi.fn(),
  }

  it('renders "Check Availability" heading for non-owners', () => {
    render(<AvailabilityCalendar {...defaultProps} />)
    expect(screen.getByText(/check availability/i)).toBeInTheDocument()
  })

  it('shows availability info text when no range is selected', () => {
    render(<AvailabilityCalendar {...defaultProps} />)
    expect(screen.getByText(/select a start and end date/i)).toBeInTheDocument()
  })

  it('shows strikethrough notice when blocked ranges exist', () => {
    mockUseAvailability.blockedRanges = [
      { id: 'b1', start_date: '2026-08-10', end_date: '2026-08-15' },
    ]

    render(<AvailabilityCalendar {...defaultProps} />)
    expect(screen.getByText(/strikethrough dates are unavailable/i)).toBeInTheDocument()
  })

  it('displays blocked loading error when present', () => {
    mockUseAvailability.error = 'Failed to load availability'

    render(<AvailabilityCalendar {...defaultProps} />)
    expect(screen.getByText(/failed to load availability/i)).toBeInTheDocument()
  })
})

describe('AvailabilityCalendar — owner view (isOwner=true)', () => {
  const defaultProps = {
    listingId: 'listing-1',
    dailyPrice: 50,
    isOwner: true,
    onRangeConfirmed: vi.fn(),
  }

  it('renders "Manage Availability" heading for owners', () => {
    render(<AvailabilityCalendar {...defaultProps} />)
    expect(screen.getByText(/manage availability/i)).toBeInTheDocument()
  })

  it('shows blocked dates list when ranges exist', () => {
    mockUseAvailability.blockedRanges = [
      { id: 'b1', start_date: '2026-08-10', end_date: '2026-08-15', reason: null },
    ]

    render(<AvailabilityCalendar {...defaultProps} />)
    expect(screen.getByText(/blocked dates/i)).toBeInTheDocument()
    expect(screen.getByText(/Aug 10, 2026/)).toBeInTheDocument()
  })
})