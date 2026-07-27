/**
 * DashboardPage — Owner/renter dashboard with tabbed navigation.
 *
 * Four tabs: My Listings, My Rentals, Requests, Rented Out.
 * Tab state is persisted via useSearchParams so the active tab survives
 * page refreshes and is shareable/bookmarkable.
 *
 * On desktop, tabs render as a horizontal tab bar. On mobile (< sm),
 * they render as a dropdown <select> for compact navigation.
 *
 * Top of page: 4 stat cards summarising key metrics.
 */

import { useSearchParams } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { useListings } from "../features/listings/hooks/useListings";
import { useBookings } from "../features/bookings/hooks/useBookings";
import { PageHeader, DashboardLayout } from "../layouts";
import MyListingsTab from "../components/dashboard/MyListingsTab";
import MyRentalsTab from "../components/dashboard/MyRentalsTab";
import RequestsTab from "../components/dashboard/RequestsTab";
import RentedOutTab from "../components/dashboard/RentedOutTab";

const TABS = [
  { key: "listings", label: "My Listings" },
  { key: "rentals", label: "My Rentals" },
  { key: "requests", label: "Requests" },
  { key: "rented-out", label: "Rented Out" },
];

/**
 * @returns {JSX.Element} The dashboard page with stat cards and tabbed content.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "listings";

  // Fetch summary stats for the stat cards
  const { totalCount: listingCount } = useListings({
    owner_id: user?.id,
    includeInactive: true,
    page: 1,
    limit: 1,
  });
  const { data: rentalBookings } = useBookings("rentals");
  const { data: requestBookings } = useBookings("requests");
  const { data: rentedOutBookings } = useBookings("rented-out");

  // Active Bookings = approved bookings from BOTH sides combined:
  // - renter-side: bookings where the user is the renter and status is approved
  // - owner-side: bookings where the user owns the listing and status is approved
  const activeBookings =
    (rentalBookings ?? []).filter((b) => b.status === "approved").length +
    (rentedOutBookings ?? []).filter((b) => b.status === "approved").length;
  const pendingRequests = (requestBookings ?? []).filter(
    (b) => b.status === "pending"
  ).length;

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" className="mb-6" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Listings" value={listingCount ?? 0} />
        <StatCard label="Active Bookings" value={activeBookings} />
        <StatCard label="Pending Requests" value={pendingRequests} />
        <StatCard label="Total Earnings" value="$0.00" subtitle="Coming soon" />
      </div>

      {/* Tab bar — desktop */}
      <div className="hidden sm:flex items-center gap-1 border-b border-border mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-text-muted/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab selector — mobile dropdown */}
      <div className="sm:hidden mb-6">
        <select
          value={activeTab}
          onChange={(e) => handleTabChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {TABS.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active tab content */}
      {activeTab === "listings" && <MyListingsTab />}
      {activeTab === "rentals" && <MyRentalsTab />}
      {activeTab === "requests" && <RequestsTab />}
      {activeTab === "rented-out" && <RentedOutTab />}
    </DashboardLayout>
  );
}

/**
 * Individual stat card component.
 * @param {{ label: string, value: string|number, subtitle?: string }} props
 */
function StatCard({ label, value, subtitle }) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
        {value}
      </p>
      {subtitle && (
        <p className="text-[11px] text-text-secondary mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
