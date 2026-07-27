import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useBookings } from "../../features/bookings/hooks/useBookings";
import FadeInSection from "../../shared/components/FadeInSection";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function DashboardBookings() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: rentedOutBookings, loading, error } = useBookings("rented-out");

  const filtered = useMemo(() => {
    if (!rentedOutBookings) return [];
    if (statusFilter === "all") return rentedOutBookings;
    return rentedOutBookings.filter((b) => b.status === statusFilter);
  }, [rentedOutBookings, statusFilter]);

  return (
    <div className="space-y-6">
      <FadeInSection>
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">
            Booking Management
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage bookings for your listings.
          </p>
        </div>
      </FadeInSection>

      {/* Status filter tabs */}
      <FadeInSection>
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                statusFilter === tab.key
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-text-muted/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </FadeInSection>

      {/* Table */}
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
            <p className="text-sm text-text-muted">
              {statusFilter === "all"
                ? "No bookings yet. When someone books your listing, it will appear here."
                : `No ${statusFilter} bookings.`}
            </p>
            <Link to="/" className="inline-block mt-2 text-sm font-medium text-accent hover:underline">
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
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Renter</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Item</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Dates</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Total</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((booking) => {
                    const listing = booking.listings;
                    const renter = booking.profiles;
                    return (
                      <tr key={booking.id} className="hover:bg-surface-secondary/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-text-primary font-medium">{renter?.full_name || "Anonymous"}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-text-primary">{listing?.title || "—"}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-mono text-text-secondary">
                            {new Date(booking.start_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                            {" — "}
                            {new Date(booking.end_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-sm font-mono font-bold text-text-primary">${booking.total_price}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusTag status={booking.status} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            to={`/booking/${booking.id}`}
                            className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((booking) => {
                const listing = booking.listings;
                const renter = booking.profiles;
                return (
                  <Link
                    key={booking.id}
                    to={`/booking/${booking.id}`}
                    className="block bg-surface border border-border rounded-lg p-4 hover:bg-surface-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{listing?.title}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{renter?.full_name || "Anonymous"}</p>
                      </div>
                      <StatusTag status={booking.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="font-mono">
                        {new Date(booking.start_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                        {" — "}
                        {new Date(booking.end_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                      <span className="font-mono font-bold text-text-primary">${booking.total_price}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </FadeInSection>
    </div>
  );
}

function StatusTag({ status }) {
  const colors = {
    pending: "border-warning/30 text-warning",
    approved: "border-success/30 text-success",
    declined: "border-danger/30 text-danger",
    completed: "border-sage/30 text-sage",
    cancelled: "border-text-muted/30 text-text-muted",
  };
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded border ${colors[status] || "border-border text-text-muted"}`}>
      {status}
    </span>
  );
}
