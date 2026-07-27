import { useAuth } from "../../features/auth/context/AuthContext";
import { useListings } from "../../features/listings/hooks/useListings";
import { useBookings } from "../../features/bookings/hooks/useBookings";
import FadeInSection from "../../shared/components/FadeInSection";

export default function DashboardAnalytics() {
  const { user } = useAuth();

  const { listings, loading: listingsLoading } = useListings({
    owner_id: user?.id,
    includeInactive: true,
    sort: "newest",
    page: 1,
    limit: 100,
  });
  const { data: rentedOutBookings } = useBookings("rented-out");
  const { data: requestBookings } = useBookings("requests");

  const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);
  const activeListings = listings.filter((l) => l.is_active).length;
  const totalBookings = (rentedOutBookings ?? []).length;
  const totalRequests = (requestBookings ?? []).length;
  const conversionRate = totalViews > 0 ? ((totalRequests / totalViews) * 100).toFixed(1) : "—";

  const topListings = [...listings]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5);

  const metrics = [
    { label: "Revenue", value: "$0.00", subtitle: "Not yet wired" },
    { label: "Total Bookings", value: totalBookings },
    { label: "Active Listings", value: activeListings },
    { label: "Total Requests", value: totalRequests },
    { label: "Total Views", value: totalViews },
    { label: "Conversion Rate", value: typeof conversionRate === "string" ? conversionRate : `${conversionRate}%` },
    { label: "Total Listings", value: listings.length },
    { label: "Upcoming Rentals", value: (rentedOutBookings ?? []).filter((b) => b.status === "approved" && new Date(b.start_date) > new Date()).length },
  ];

  return (
    <div className="space-y-10">
      <FadeInSection>
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">
            Analytics
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Key metrics and performance for your rentals.
          </p>
        </div>
      </FadeInSection>

      {/* Metric cards */}
      <FadeInSection>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </FadeInSection>

      {/* Chart containers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeInSection>
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-sm font-heading font-semibold text-text-primary mb-4">
              Revenue Over Time
            </h3>
            <div className="h-48 flex items-center justify-center bg-surface-secondary/50 rounded-lg">
              <ChartEmptyState message="No revenue data yet. Connect a payment provider to see trends." />
            </div>
          </div>
        </FadeInSection>
        <FadeInSection>
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-sm font-heading font-semibold text-text-primary mb-4">
              Bookings Over Time
            </h3>
            <div className="h-48 flex items-center justify-center bg-surface-secondary/50 rounded-lg">
              <ChartEmptyState message="Booking data will appear once you have active rentals." />
            </div>
          </div>
        </FadeInSection>
      </div>

      {/* Top performing listings */}
      <FadeInSection>
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-heading font-semibold text-text-primary">
              Top Performing Listings
            </h3>
          </div>
          {listingsLoading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-surface-tertiary/40 rounded animate-pulse" />
              ))}
            </div>
          ) : topListings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-text-muted">Create your first listing to see performance data.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {topListings.map((listing, i) => (
                <div key={listing.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-5 text-sm font-mono text-text-muted shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{listing.title}</p>
                  </div>
                  <span className="text-xs font-mono text-text-secondary w-16 text-right">{listing.view_count || 0} views</span>
                  <span className="text-xs font-mono text-text-secondary w-20 text-right">${listing.daily_price}/day</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeInSection>
    </div>
  );
}

function MetricCard({ label, value, subtitle }) {
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

function ChartEmptyState({ message }) {
  return (
    <div className="text-center px-4">
      <p className="text-xs text-text-muted">{message}</p>
    </div>
  );
}
