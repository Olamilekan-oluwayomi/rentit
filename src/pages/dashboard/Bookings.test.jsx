/*
 * DashboardBookings — Tests the Lending / Renting role switch and the
 * approve / decline / cancel actions.
 *
 * The page writes straight to the bookings table (and to `availability` when
 * approving, so the listing's calendar is blocked), so these tests assert both
 * the confirmation flow and the exact writes it performs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const ownerBookings = [
  {
    id: 'b-pending',
    listing_id: 'l1',
    renter_id: 'renter-9',
    start_date: '2026-08-10',
    end_date: '2026-08-12',
    total_price: 90,
    status: 'pending',
    listings: { id: 'l1', title: 'Drill', owner_id: 'owner-1' },
    profiles: { full_name: 'Ada Renter' },
  },
  {
    id: 'b-approved',
    listing_id: 'l2',
    renter_id: 'renter-8',
    start_date: '2026-07-01',
    end_date: '2026-07-03',
    total_price: 45,
    status: 'approved',
    listings: { id: 'l2', title: 'Ladder', owner_id: 'owner-1' },
    profiles: { full_name: 'Grace Booker' },
  },
]

const renterBookings = [
  {
    id: 'b-mine',
    listing_id: 'l3',
    renter_id: 'me',
    start_date: '2026-08-20',
    end_date: '2026-08-22',
    total_price: 60,
    status: 'pending',
    listings: { id: 'l3', title: 'Camera', owner_id: 'other-owner' },
  },
]

const addToast = vi.fn()

// Stable across renders so a write's refetch() can be asserted, and
// overridable per-test so the loading and error branches can be rendered.
const refetch = vi.fn()
const hookOverrides = {}

vi.mock('../../features/bookings/hooks/useBookings', () => ({
  useBookings: (type) => ({
    data: type === 'owner' ? ownerBookings : renterBookings,
    loading: false,
    error: null,
    refetch,
    ...hookOverrides,
  }),
}))

vi.mock('../../shared/contexts/ToastContext', () => ({
  useToast: () => ({ addToast }),
}))

vi.mock('../../shared/lib/supabase')

// ReviewPrompt does its own auth + reviews lookup; eligibility is covered by
// useReviewEligibility.test.js, so stub it out to keep this file focused.
vi.mock('../../features/reviews/components/ReviewPrompt', () => ({
  default: () => null,
}))

import { supabase } from '../../shared/lib/supabase'
import DashboardBookings from './Bookings'

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardBookings />
    </MemoryRouter>
  )
}

/** The desktop table and the mobile card list both render the same actions. */
function rowAction(name) {
  return screen.getAllByRole('button', { name })[0]
}

/** Finds the chain for a table that had .update() called on it. */
function updatedChain(table) {
  return supabase.from.mock.results
    .map((r) => r.value)
    .find((c) => c && c.__table === table && c.update.mock.calls.length > 0)
}

beforeEach(() => {
  supabase.__reset()
  addToast.mockClear()
  refetch.mockClear()
  for (const key of Object.keys(hookOverrides)) delete hookOverrides[key]
})

describe('DashboardBookings — Lending role', () => {
  it('shows the renter and both actions for a pending request', () => {
    renderPage()

    expect(screen.getAllByText('Ada Renter').length).toBeGreaterThan(0)
    expect(rowAction('Approve')).toBeInTheDocument()
    expect(rowAction('Decline')).toBeInTheDocument()
  })

  it('offers no approve/decline for a non-pending booking', () => {
    renderPage()

    // One row is pending, so exactly one Approve/Decline pair is rendered in
    // each of the desktop and mobile layouts.
    expect(screen.getAllByRole('button', { name: 'Approve' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Decline' })).toHaveLength(2)
  })

  it('asks for confirmation before approving', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(rowAction('Approve'))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Approve this booking?')).toBeInTheDocument()
    // Nothing is written until the dialog is confirmed.
    expect(updatedChain('bookings')).toBeUndefined()
  })

  it('approves the booking and blocks the dates on the calendar', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(rowAction('Approve'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Approve' }))

    await waitFor(() => expect(updatedChain('bookings')).toBeDefined())

    const chain = updatedChain('bookings')
    expect(chain.update).toHaveBeenCalledWith({ status: 'approved' })
    expect(chain.eq).toHaveBeenCalledWith('id', 'b-pending')
    expect(addToast).toHaveBeenCalledWith('Booking approved.')

    // Approving must also reserve the listing's calendar for those dates.
    const availabilityChain = supabase.from.mock.results
      .map((r) => r.value)
      .find((c) => c && c.__table === 'availability')
    expect(availabilityChain.insert).toHaveBeenCalledWith({
      listing_id: 'l1',
      start_date: '2026-08-10',
      end_date: '2026-08-12',
      is_blocked: true,
      reason: 'Booked',
    })
  })

  it('reports a failure to block dates without undoing the approval', async () => {
    const user = userEvent.setup()
    // The booking update succeeds; only the calendar insert fails.
    supabase.__setMockData('availability', { data: null, error: { message: 'conflict' } })
    renderPage()

    await user.click(rowAction('Approve'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Approve' }))

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        'Approved, but the dates could not be blocked automatically.',
        'error'
      )
    )
    // The approval itself still went through.
    expect(updatedChain('bookings').update).toHaveBeenCalledWith({ status: 'approved' })
  })

  it('declines the booking without touching the calendar', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(rowAction('Decline'))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Decline this booking?')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Decline' }))

    await waitFor(() => expect(updatedChain('bookings')).toBeDefined())

    const chain = updatedChain('bookings')
    expect(chain.update).toHaveBeenCalledWith({ status: 'declined' })
    expect(addToast).toHaveBeenCalledWith('Booking declined.')

    const availabilityChain = supabase.from.mock.results
      .map((r) => r.value)
      .find((c) => c && c.__table === 'availability')
    expect(availabilityChain).toBeUndefined()
  })

  it('surfaces an update error and writes nothing on failure', async () => {
    const user = userEvent.setup()
    supabase.__setMockData('bookings', { data: null, error: { message: 'permission denied' } })
    renderPage()

    await user.click(rowAction('Decline'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Decline' }))

    await waitFor(() => expect(addToast).toHaveBeenCalledWith('permission denied', 'error'))
  })

  it('closes the dialog without writing when cancelled', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(rowAction('Approve'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(updatedChain('bookings')).toBeUndefined()
  })
})

describe('DashboardBookings — Renting role', () => {
  it('shows the renter their own bookings with a cancel action', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Renting' }))

    expect(screen.getAllByText('Camera').length).toBeGreaterThan(0)
    expect(rowAction('Cancel')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  })

  it('cancels the booking with the renter wording', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Renting' }))
    await user.click(rowAction('Cancel'))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Cancel this booking?')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Cancel booking' }))

    await waitFor(() => expect(updatedChain('bookings')).toBeDefined())

    const chain = updatedChain('bookings')
    expect(chain.update).toHaveBeenCalledWith({ status: 'cancelled' })
    expect(chain.eq).toHaveBeenCalledWith('id', 'b-mine')
    expect(addToast).toHaveBeenCalledWith('Booking cancelled.')
  })
})

describe('DashboardBookings — status filter', () => {
  it('narrows the list to the selected status', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Approved' }))

    expect(screen.queryByText('Drill')).not.toBeInTheDocument()
    expect(screen.getAllByText('Ladder').length).toBeGreaterThan(0)
  })

  it('includes a declined filter, which the status list previously omitted', () => {
    renderPage()

    expect(screen.getByRole('button', { name: 'Declined' })).toBeInTheDocument()
  })

  it('falls back to a generic message for statuses without role-specific copy', async () => {
    const user = userEvent.setup()
    renderPage()

    // Owner role has no `completed` entry in EMPTY_COPY, so the generic
    // fallback string is used.
    await user.click(screen.getByRole('button', { name: 'Completed' }))
    expect(screen.getByText('No completed bookings.')).toBeInTheDocument()
  })

  it('shows renter-specific empty copy once the role is switched', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Renting' }))
    await user.click(screen.getByRole('button', { name: 'Approved' }))

    expect(screen.getByText('You have no active rentals.')).toBeInTheDocument()
  })

  it('renders a skeleton instead of rows while loading', () => {
    hookOverrides.loading = true

    renderPage()

    expect(screen.queryByText('Ada Renter')).not.toBeInTheDocument()
    // Four pulsing placeholder rows.
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(4)
  })

  it('surfaces the error message when the fetch fails', () => {
    hookOverrides.error = 'Could not load bookings'

    renderPage()

    expect(screen.getByText('Could not load bookings')).toBeInTheDocument()
    expect(screen.queryByText('Ada Renter')).not.toBeInTheDocument()
  })

  it('refetches after a successful write', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(rowAction('Approve'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Approve' }))

    await vi.waitFor(() => expect(refetch).toHaveBeenCalled())
  })

  it('does not refetch when the user cancels the confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(rowAction('Approve'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(refetch).not.toHaveBeenCalled()
    expect(updatedChain('bookings')).toBeUndefined()
  })
})