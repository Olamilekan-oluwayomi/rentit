/*
|--------------------------------------------------------------------------
| useFavorites.js
|--------------------------------------------------------------------------
|
| Context provider and hook for managing user's saved/favorited listings.
|
| FavoritesProvider: wraps authenticated routes, fetches favorite listing
| IDs on mount, and provides toggle + query functions.
|
| useFavorites(): consumer hook — returns the favorites Set and helpers.
|
| Toggle is optimistic: the Set updates instantly, then writes to Supabase.
| On failure the Set rolls back and a toast is shown.
|
|--------------------------------------------------------------------------
*/

import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { useToast } from "../../../shared/contexts/ToastContext";
import { supabase } from "../../../shared/lib/supabase";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [favorites, setFavorites] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const toggleLoadingRef = useRef(false);

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => {
        setFavorites(new Set());
        setLoading(false);
      });
      return;
    }

    let cancelled = false;

    const fetchFavorites = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id);

      if (!cancelled) {
        if (error) {
          setFavorites(new Set());
        } else {
          setFavorites(new Set(data.map((f) => f.listing_id)));
        }
        setLoading(false);
      }
    };

    fetchFavorites();
    return () => { cancelled = true; };
  }, [user, refreshKey]);

  const toggleFavorite = useCallback(async (listingId) => {
    if (!user) {
      addToast("Log in to save listings", "info");
      return false;
    }

    if (toggleLoadingRef.current) return false;
    toggleLoadingRef.current = true;

    const wasFavorited = favorites.has(listingId);

    // Optimistic update
    setFavorites((prev) => {
      const next = new Set(prev);
      if (wasFavorited) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });

    const result = wasFavorited
      ? await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
      : await supabase
          .from("favorites")
          .insert({ user_id: user.id, listing_id: listingId });

    const error = result.error;

    toggleLoadingRef.current = false;

    if (error) {
      // Rollback
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });
      addToast("Something went wrong. Please try again.", "error");
      return false;
    }

    return true;
  }, [user, favorites, addToast]);

  const isFavorited = useCallback((listingId) => {
    return favorites.has(listingId);
  }, [favorites]);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return createElement(
    FavoritesContext.Provider,
    // toggleFavorite guards concurrent toggles with a ref lock, but it is only
    // ever invoked from event handlers, never during render.
    // eslint-disable-next-line react-hooks/refs
    { value: { favorites, loading, toggleFavorite, isFavorited, refetch } },
    children
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    // Outside a FavoritesProvider (e.g. public pages) — return safe no-ops
    // so components like ListingCard work without error.
    return {
      favorites: new Set(),
      loading: false,
      toggleFavorite: async () => false,
      isFavorited: () => false,
      refetch: () => {},
    };
  }
  return ctx;
}
