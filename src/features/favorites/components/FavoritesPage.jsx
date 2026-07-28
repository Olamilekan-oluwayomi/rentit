/*
|--------------------------------------------------------------------------
| FavoritesPage.jsx
|--------------------------------------------------------------------------
|
| Shows all listings the current user has saved/favorited.
| Fetches full listing data for the user's favorited IDs and displays
| them in a responsive grid using ListingCard.
|
| Route: /favorites (protected, under AppLayout)
| Responsibilities: Display saved listings with remove capability
| Dependencies: useFavorites, useAuth, supabase, ListingCard, EmptyState
|
|--------------------------------------------------------------------------
*/

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import { supabase } from "../../../shared/lib/supabase";
import { Button, EmptyState } from "../../../design";
import ListingCard from "../../listings/components/ListingCard";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favoritesLoading || !user) return;

    if (favorites.size === 0) {
      setListings([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchListings = async () => {
      setLoading(true);
      const ids = Array.from(favorites);

      const { data, error } = await supabase
        .from("listings")
        .select("*, owner:owner_id(id, full_name, avatar_url)")
        .in("id", ids)
        .eq("is_active", true);

      if (!cancelled) {
        setListings(error ? [] : data || []);
        setLoading(false);
      }
    };

    fetchListings();
    return () => { cancelled = true; };
  }, [favorites, favoritesLoading, user]);

  if (favoritesLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="mb-8">
          <div className="h-8 bg-surface-tertiary/60 rounded w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-4/3 bg-surface-tertiary/40" />
              <div className="p-3 space-y-2.5">
                <div className="h-4 bg-surface-tertiary/60 rounded w-4/5" />
                <div className="h-5 bg-surface-tertiary/60 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Saved Listings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {listings.length} {listings.length === 1 ? "listing" : "listings"} saved
        </p>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved listings yet"
          description="Tap the heart icon on any listing to save it here for later."
          action={
            <Link to="/">
              <Button>Browse Listings</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
