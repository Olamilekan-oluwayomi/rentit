/*
|--------------------------------------------------------------------------
| DashboardBookings.jsx
|--------------------------------------------------------------------------
|
| Booking management page for the dashboard. One page, two roles:
|
|   Lending — bookings other people requested on the user's own listings.
|             Owners can approve or decline pending requests. Approving also
|             blocks the listing's calendar for those dates.
|   Renting — bookings the user made as a renter. Renters can cancel while a
|             booking is still pending or approved, and can leave a review once
|             the rental period has ended.
|
| Route: /dashboard/bookings (mounted inside DashboardShell)
| Responsibilities: Display, filter, and action owner- and renter-side bookings
| Dependencies: useBookings, supabase, useToast, ConfirmDialog, ReviewPrompt,
|   StatusBadge, FadeInSection, lucide-react
| Notes: Approve/Decline/Cancel write directly to the bookings table and
|        refresh via refetch(). The status filter buttons are aria-pressed
|        toggles rather than role="tab", since they filter one list instead of
|        switching panels.
|
|--------------------------------------------------------------------------
*/

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { useBookings } from "../../features/bookings/hooks/useBookings";
import { useToast } from "../../shared/contexts/ToastContext";
import { supabase } from "../../shared/lib/supabase";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import ReviewPrompt from "../../features/reviews/components/ReviewPrompt";
import StatusBadge from "../../features/bookings/components/StatusBadge";
import FadeInSection from "../../shared/components/FadeInSection";
import { Button } from "../../design";

const STATUS_FILTERS = ["all", "pending", "approved", "completed", "declined", "cancelled"];

const STATUS_LABELS = {
  all: "All",
  pending: "Pending",
  approved: "Approved",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};

const EMPTY_COPY = {
  owner: {
    all: "No bookings yet. When someone requests one of your listings, it will appear here.",
    pending: "No pending requests right now.",
  },
  renter: {
    all: "You haven't rented anything yet. Browse listings to get started.",
    pending: "You have no pending requests.",
    approved: "You have no active rentals.",
  },
};

export default function DashboardBookings() {
  const { addToast } = useToast();
  const [role, setRole] = useState("owner");
  const [statusFilter, setStatusFilter] = useState("all");

  const owner = useBookings("owner");
  const renter = useBookings("rentals");

  // Only the active role's fetch drives the UI, but both hooks stay mounted so
  // switching roles is instant. This also keeps both counts warm for realtime
  // refreshes.
  const { data, loading, error, refetch } = role === "owner" ? owner : renter;

  const filtered = useMemo(() => {
    if (!data) return [];
    if (statusFilter === "all") return data;
    return data.filter((b) => b.status === statusFilter);
  }, [data, statusFilter]);

  // ── Actions ──────────────────────────────────────────────────────────
  const [busyId, setBusyId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // { type, booking }

  const closeConfirm = () => {
    if (!pendingAction) return;
    setPendingAction(null);
    setBusyId(null);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    const { type, booking } = pendingAction;
    setBusyId(booking.id);

    const nextStatus =
      type === "approve" ? "approved" : type === "decline" ? "declined" : "cancelled";

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: nextStatus })
      .eq("id", booking.id);

    if (updateError) {
      addToast(updateError.message, "error");
      closeConfirm();
      return;
    }

    // Approving reserves the listing's calendar for those dates so the item
    // cannot be double-booked. A failure here is reported but does not undo the
    // approval — the owner can block dates manually.
    if (type === "approve") {
      const { error: blockError } = await supabase.from("availability").insert({
        listing_id: booking.listing_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        is_blocked: true,
        reason: "Booked",
      });

      if (blockError) {
        addToast("Approved, but the dates could not be blocked automatically.", "error");
      }
    }

    const message = {
      approve: "Booking approved.",
      decline: "Booking declined.",
      cancel: "Booking cancelled.",
    }[type];

    addToast(message);
    closeConfirm();
    refetch();
  };

  const requestAction = (type, booking) => {
    setPendingAction({ type, booking });
  };

  // The specific action in flight, so only that button shows a spinner while
  // its siblings stay visible but disabled.
  const busyAction = busyId ? (pendingAction?.type ?? null) : null;

  const confirmCopy = {
    approve: {
      title: "Approve this booking?",
      message: "The renter will be notified and these dates will be blocked on your calendar.",
      confirmLabel: "Approve",
      danger: false,
    },
    decline: {
      title: "Decline this booking?",
      message: "The renter will be notified that you declined. This cannot be undone.",
      confirmLabel: "Decline",
      danger: true,
    },
    cancel: {
      title: "Cancel this booking?",
      message: "The owner will be notified. This cannot be undone.",
      confirmLabel: "Cancel booking",
      danger: true,
    },
  }[pendingAction?.type];

  const emptyCopy =
    EMPTY_COPY[role === "owner" ? "owner" : "renter"][statusFilter] ??
    `No ${STATUS_LABELS[statusFilter].toLowerCase()} bookings.`;

  return (
    <div className="space-y-6">
      <FadeInSection>
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Bookings</h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage requests on your listings and rentals you&apos;ve booked.
          </p>
        </div>
      </FadeInSection>

      {/* Role switcher */}
      <FadeInSection>
        <div className="inline-flex items-center gap-1 p-1 bg-surface-secondary rounded-lg" role="group" aria-label="Booking role">
          <RoleButton active={role === "owner"} onClick={() => setRole("owner")}>
            Lending
          </RoleButton>
          <RoleButton active={role === "renter"} onClick={() => setRole("renter")}>
            Renting
          </RoleButton>
        </div>
      </FadeInSection>

      {/* Status filter */}
      <FadeInSection>
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {STATUS_FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              aria-pressed={statusFilter === key}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                statusFilter === key
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-text-muted/30"
              }`}
            >
              {STATUS_LABELS[key]}
            </button>
          ))}
        </div>
      </FadeInSection>

      <FadeInSection>
        {loading ? (
          <div className="bg-surface border border-border rounded-lg divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-surface-tertiary/60 rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-tertiary/40 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-surface border border-border rounded-lg p-8 text-center">
            <p className="text-sm text-text-secondary">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
              <CalendarDays size={24} className="text-text-muted" />
            </div>
            <p className="text-sm text-text-muted">{emptyCopy}</p>
            <Link
              to="/"
              className="inline-block mt-3 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-surface border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary/50">
                    <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Item</th>
                    {role === "owner" && (
                      <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Renter</th>
                    )}
                    <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Dates</th>
                    <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Total</th>
                    <th scope="col" className="text-center px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                    <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      role={role}
                      busyAction={busyAction}
                      onAction={requestAction}
                      onReviewed={refetch}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  role={role}
                  busyAction={busyAction}
                  onAction={requestAction}
                  onReviewed={refetch}
                />
              ))}
            </div>
          </>
        )}
      </FadeInSection>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={confirmCopy?.title ?? ""}
        message={confirmCopy?.message ?? ""}
        confirmLabel={confirmCopy?.confirmLabel ?? "Confirm"}
        danger={confirmCopy?.danger ?? false}
        loading={Boolean(busyId)}
        onConfirm={confirmAction}
        onCancel={closeConfirm}
      />
    </div>
  );
}

function RoleButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
        active
          ? "bg-surface text-text-primary shadow-sm"
          : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Decides which actions apply to a booking for the active role.
 * Owners act on pending requests; renters can cancel until the rental starts.
 */
function actionsFor(booking, role) {
  if (role === "owner") {
    return booking.status === "pending"
      ? [
          { type: "approve", label: "Approve", variant: "primary" },
          { type: "decline", label: "Decline", variant: "outline" },
        ]
      : [];
  }

  return booking.status === "pending" || booking.status === "approved"
    ? [{ type: "cancel", label: "Cancel", variant: "outline" }]
    : [];
}

function useBookingRow(booking, role, busyAction, onAction, onReviewed) {
  const revieweeId = role === "owner" ? booking.renter_id : booking.listings?.owner_id;
  return {
    listing: booking.listings,
    renter: booking.profiles,
    actions: actionsFor(booking, role),
    revieweeId,
    showReviewPrompt: role === "owner" || revieweeId != null,
    busyAction,
    onAction,
    onReviewed,
  };
}

function BookingActions({ actions, busyAction, onAction, booking }) {
  if (actions.length === 0) {
    return (
      <Link
        to={`/booking/${booking.id}`}
        className="text-sm font-medium text-accent hover:text-accent-hover transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
      >
        View
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {actions.map((action) => (
        <Button
          key={action.type}
          size="sm"
          variant={action.variant}
          loading={busyAction === action.type}
          disabled={Boolean(busyAction)}
          onClick={() => onAction(action.type, booking)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

function formatDates(booking) {
  const opts = { month: "short", day: "numeric" };
  return `${new Date(booking.start_date).toLocaleDateString([], opts)} — ${new Date(
    booking.end_date
  ).toLocaleDateString([], opts)}`;
}

function BookingRow({ booking, role, busyAction, onAction, onReviewed }) {
  const row = useBookingRow(booking, role, busyAction, onAction, onReviewed);

  return (
    <>
      <tr className="hover:bg-surface-secondary/50 transition-colors align-top">
        <td className="px-4 py-3.5">
          <span className="text-sm text-text-primary">{row.listing?.title || "—"}</span>
        </td>
        {role === "owner" && (
          <td className="px-4 py-3.5">
            <span className="text-sm text-text-primary font-medium">
              {row.renter?.full_name || "Anonymous"}
            </span>
          </td>
        )}
        <td className="px-4 py-3.5">
          <span className="text-sm font-mono text-text-secondary">{formatDates(booking)}</span>
        </td>
        <td className="px-4 py-3.5 text-right">
          <span className="text-sm font-mono font-bold text-text-primary">${booking.total_price}</span>
        </td>
        <td className="px-4 py-3.5 text-center">
          <StatusBadge status={booking.status} />
        </td>
        <td className="px-4 py-3.5 text-right">
          <BookingActions
            actions={row.actions}
            busyAction={busyAction}
            onAction={onAction}
            booking={booking}
          />
        </td>
      </tr>
      {row.showReviewPrompt && (
        <tr className="bg-surface-secondary/20">
          <td colSpan={role === "owner" ? 6 : 5}>
            <ReviewPrompt
              booking={booking}
              revieweeId={row.revieweeId}
              onReviewUpdate={onReviewed}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function BookingCard({ booking, role, busyAction, onAction, onReviewed }) {
  const row = useBookingRow(booking, role, busyAction, onAction, onReviewed);

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{row.listing?.title || "—"}</p>
          {role === "owner" && (
            <p className="text-xs text-text-secondary mt-0.5">{row.renter?.full_name || "Anonymous"}</p>
          )}
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted mb-3">
        <span className="font-mono">{formatDates(booking)}</span>
        <span className="font-mono font-bold text-text-primary">${booking.total_price}</span>
      </div>

      <div className="flex items-center justify-end gap-2">
        <BookingActions actions={row.actions} busyAction={busyAction} onAction={onAction} booking={booking} />
      </div>

      {row.showReviewPrompt && (
        <ReviewPrompt booking={booking} revieweeId={row.revieweeId} onReviewUpdate={onReviewed} />
      )}
    </div>
  );
}