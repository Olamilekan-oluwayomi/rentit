/*
|--------------------------------------------------------------------------
| DashboardHome.jsx
|--------------------------------------------------------------------------
|
| Dashboard home / welcome page. Shows a welcome greeting, stat cards
| (Total Listings, Active Bookings, Pending Requests, Earnings), recent
| bookings list, quick action buttons, and upcoming rentals section.
|
| Route: /dashboard (mounted inside DashboardShell)
| Responsibilities: Provide dashboard overview with stats and recent activity
| Dependencies: useListings, useBookings, lucide-react, FadeInSection, Button
| Notes: StatCard and StatusTag are file-private components.
|
|--------------------------------------------------------------------------
*/

import { Link } from "react-router-dom";
import { Plus, MessageSquare, BarChart3, CalendarDays, Clock } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useListings } from "../../features/listings/hooks/useListings";
import { useBookings } from "../../features/bookings/hooks/useBookings";
import { Button } from "../../design";
import FadeInSection from "../../shared/components/FadeInSection";

export default function DashboardHome() {
  const { user } = useAuth();

  const { totalCount: listingCount } = useListings({
    owner_id: user?.id,
    includeInactive: true,
    page: 1,
    limit: 1,
  });
  const { data: rentalBookings, loading: rentalLoading, error: rentalError } = useBookings("rentals");
  const { data: requestBookings, loading: requestLoading, error: requestError } = useBookings("requests");
  const { data: rentedOutBookings, loading: rentedOutLoading, error: rentedOutError } = useBookings("rented-out");

  const activeBookings =
    (rentalBookings ?? []).filter((b) => b.status === "approved").length +
    (rentedOutBookings ?? []).filter((b) => b.status === "approved").length;
  const pendingRequests =
    (rentalBookings ?? []).filter((b) => b.status === "pending").length +
    (requestBookings ?? []).filter((b) => b.status === "pending").length;

  const allBookings = [...(rentedOutBookings ?? []), ...(rentalBookings ?? [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const upcomingRentals = (rentalBookings ?? [])
    .filter((b) => b.status === "approved" && new Date(b.start_date) > new Date())
    .slice(0, 3);

  const bookingsLoading = rentalLoading || rentedOutLoading || requestLoading;
  const bookingsError = rentalError || rentedOutError || requestError;

  const displayName = user?.user_metadata?.full_name || "there";

  return (
    <div className="space-y-10">
      {/* Welcome + quick actions */}
      <FadeInSection>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold text-text-primary">
              Welcome back, {displayName}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Here&apos;s what&apos;s happening with your rentals today.
            </p>
          </div>
          <Link to="/listings/new">
            <Button leftIcon={Plus}>Create Listing</Button>
          </Link>
        </div>
      </FadeInSection>

      {/* Stat cards */}
      <FadeInSection>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Listings" value={listingCount ?? 0} />
          <StatCard label="Active Bookings" value={activeBookings} />
          <StatCard label="Pending Requests" value={pendingRequests} />
          <StatCard label="Total Earnings" value="$0.00" subtitle="Coming soon" />
        </div>
      </FadeInSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <FadeInSection>
            <h3 className="text-base font-heading font-semibold text-text-primary mb-3">
              Recent Bookings
            </h3>
            {bookingsLoading ? (
              <div className="bg-surface border border-border rounded-lg divide-y divide-border">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-surface-tertiary/60 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-surface-tertiary/40 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : bookingsError ? (
              <div className="bg-surface border border-border rounded-lg p-8 text-center">
                <p className="text-sm text-text-secondary">Could not load bookings. Please try again later.</p>
              </div>
            ) : allBookings.length === 0 ? (
              <div className="bg-surface border border-border rounded-lg p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-secondary flex items-center justify-center">
                  <CalendarDays size={20} className="text-text-muted" />
                </div>
                <p className="text-sm text-text-muted">No bookings yet.</p>
                <Link to="/" className="inline-block mt-2 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded">
                  Browse listings to get started
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border border border-border rounded-lg">
                {allBookings.map((booking) => {
                  const listing = booking.listings;
                  const renter = booking.profiles;
                  const name = renter?.full_name || listing?.title || "Booking";
                  return (
                    <Link
                      key={booking.id}
                      to={`/booking/${booking.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-surface-secondary transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {listing?.title || "Listing"}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {name} &middot; {new Date(booking.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <StatusTag status={booking.status} />
                    </Link>
                  );
                })}
              </div>
            )}
          </FadeInSection>
        </div>

        {/* Quick Actions + Upcoming */}
        <div className="space-y-6">
          <FadeInSection>
            <h3 className="text-base font-heading font-semibold text-text-primary mb-3">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-3">
              <Link to="/listings/new">
                <Button variant="outline" leftIcon={Plus} fullWidth size="sm">
                  Create Listing
                </Button>
              </Link>
              <Link to="/dashboard/messages">
                <Button variant="outline" leftIcon={MessageSquare} fullWidth size="sm">
                  View Messages
                </Button>
              </Link>
              <Link to="/dashboard/analytics">
                <Button variant="outline" leftIcon={BarChart3} fullWidth size="sm">
                  View Analytics
                </Button>
              </Link>
            </div>
          </FadeInSection>

          <FadeInSection>
            <h3 className="text-base font-heading font-semibold text-text-primary mb-3">
              Upcoming Rentals
            </h3>
            {bookingsLoading ? (
              <div className="bg-surface border border-border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-surface-tertiary/60 rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-tertiary/40 rounded w-1/2" />
              </div>
            ) : bookingsError ? (
              <div className="bg-surface border border-border rounded-lg p-6 text-center">
                <p className="text-xs text-text-muted">Could not load upcoming rentals.</p>
              </div>
            ) : upcomingRentals.length === 0 ? (
              <div className="bg-surface border border-border rounded-lg p-6 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-surface-secondary flex items-center justify-center">
                  <Clock size={16} className="text-text-muted" />
                </div>
                <p className="text-xs text-text-muted">No upcoming rentals.</p>
              </div>
            ) : (
              <div className="divide-y divide-border border border-border rounded-lg">
                {upcomingRentals.map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/booking/${booking.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-surface-secondary transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {booking.listings?.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {new Date(booking.start_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </FadeInSection>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-mono font-bold text-text-primary">
        {value}
      </p>
      {subtitle && (
        <p className="text-[11px] text-text-secondary mt-0.5">{subtitle}</p>
      )}
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
    <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded border ${colors[status] || "border-border text-text-muted"}`}>
      {status}
    </span>
  );
}
