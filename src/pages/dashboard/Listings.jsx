import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, LayoutGrid, List as ListIcon } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useListings } from "../../features/listings/hooks/useListings";
import { Button } from "../../design";
import MyListingsTab from "../../components/dashboard/MyListingsTab";

export default function DashboardListings() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("list");

  const { totalCount } = useListings({
    owner_id: user?.id,
    includeInactive: true,
    page: 1,
    limit: 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">
            My Listings
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {totalCount ?? 0} {totalCount === 1 ? "listing" : "listings total"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-primary"}`}
              aria-label="List view"
            >
              <ListIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-primary"}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          <Link to="/listings/new">
            <Button size="sm" leftIcon={Plus}>New Listing</Button>
          </Link>
        </div>
      </div>

      <div className={viewMode === "grid" ? "hidden" : ""}>
        <MyListingsTab />
      </div>

      {viewMode === "grid" && (
        <GridView />
      )}
    </div>
  );
}

function GridView() {
  const { user } = useAuth();
  const { listings, loading } = useListings({
    owner_id: user?.id,
    includeInactive: true,
    sort: "newest",
    page: 1,
    limit: 50,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-4/3 bg-surface-tertiary/40" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-surface-tertiary/60 rounded w-3/4" />
              <div className="h-4 bg-surface-tertiary/60 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-12 text-center">
        <p className="text-sm text-text-muted">No listings yet.</p>
        <Link to="/listings/new" className="inline-block mt-2 text-sm font-medium text-accent hover:underline">
          Create your first listing
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing) => (
        <div key={listing.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:-translate-y-[2px] transition-all duration-normal">
          <Link to={`/listings/${listing.id}`}>
            <div className="relative aspect-4/3 bg-surface-tertiary/40">
              {listing.images?.[0] ? (
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/listing-images/${listing.images[0]}`}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${listing.is_active ? "border-success/30 text-success" : "border-text-muted/30 text-text-muted"}`}>
                  {listing.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </Link>
          <div className="p-3">
            <Link to={`/listings/${listing.id}`}>
              <h3 className="text-sm font-heading font-semibold text-text-primary truncate">{listing.title}</h3>
            </Link>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-mono font-bold text-text-primary">${listing.daily_price}</span>
              <span className="text-xs text-text-muted">/ day</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Link to={`/listings/${listing.id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
