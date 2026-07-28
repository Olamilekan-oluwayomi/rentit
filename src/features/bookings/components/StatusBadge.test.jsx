import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the correct text for each status', () => {
    const statuses = ['pending', 'approved', 'declined', 'completed', 'cancelled']

    statuses.forEach((status) => {
      const { unmount } = render(<StatusBadge status={status} />)
      expect(screen.getByText(new RegExp(status, 'i'))).toBeInTheDocument()
      unmount()
    })
  })

  it('applies a distinct color class for pending vs approved', () => {
    const { container: pendingContainer } = render(<StatusBadge status="pending" />)
    const { container: approvedContainer } = render(<StatusBadge status="approved" />)

    const pendingBadge = pendingContainer.firstChild
    const approvedBadge = approvedContainer.firstChild

    expect(pendingBadge.className).not.toBe(approvedBadge.className)
  })
})
