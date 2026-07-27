/**
 * EmptyState — Application-level wrapper around the design-system EmptyState.
 *
 * Adds routing: when actionLabel and actionTo are provided, renders a
 * Link-wrapped Button inside the design EmptyState.
 *
 * Usage:
 *   <EmptyState message="No listings yet" actionLabel="Browse" actionTo="/listings" />
 *
 * Accessibility:
 *   - Delegates to DesignEmptyState (see design/EmptyState/index.jsx)
 */

import { Link } from "react-router-dom";
import { EmptyState as DesignEmptyState } from "../../design";
import { Button } from "../../design";

export default function EmptyState({ message, actionLabel, actionTo }) {
  return (
    <DesignEmptyState
      description={message}
      action={
        actionLabel &&
        actionTo && (
          <Link to={actionTo}>
            <Button variant="primary">{actionLabel}</Button>
          </Link>
        )
      }
    />
  );
}
