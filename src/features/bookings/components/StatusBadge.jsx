/**
 * StatusBadge — Maps booking statuses to Badge variants with appropriate colors.
 *
 * Route: Used within booking-related views (profile bookings, listing bookings).
 * Responsibilities: Converts a booking status string into a styled Badge component.
 * Dependencies: design/Badge, STATUS_MAP lookup.
 * Important notes: Returns null for unknown statuses to gracefully handle edge cases.
 */

import { Badge } from "../../../design";

const STATUS_MAP = {
  pending: "warning",
  approved: "success",
  declined: "danger",
  completed: "accent",
  cancelled: "neutral",
};

export default function StatusBadge({ status }) {
  const variant = STATUS_MAP[status];
  if (!variant) return null;

  return <Badge variant={variant}>{status}</Badge>;
}
