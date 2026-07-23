import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

/**
 * Fetches, updates, and deletes a single listing.
 * @param {string|null} id - Listing UUID
 * @returns {{ listing, loading, error, updateListing, softDeleteListing, hardDeleteListing, restoreListing }}
 */
export function useListing(id) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch single listing ──────────────────────────────────
  const fetchListing = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      setListing(null);
    } else {
      setListing(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    (async () => {
      await fetchListing();
    })();
  }, [fetchListing]);

  // ── Update listing fields ─────────────────────────────────
  const updateListing = useCallback(
    async (updates) => {
      if (!id) return { error: "No listing ID" };
      if (!user) return { error: "Not authenticated" };

      const { data, error: updateError } = await supabase
        .from("listings")
        .upsert({ id, ...updates }, { onConflict: "id" })
        .select()
        .single();

      if (updateError) return { error: updateError.message };

      setListing(data);
      return { success: true };
    },
    [id, user]
  );

  // ── Soft delete (set is_active = false) ───────────────────
  const softDeleteListing = useCallback(async () => {
    if (!id) return { error: "No listing ID" };
    if (!user) return { error: "Not authenticated" };

    const { data, error: updateError } = await supabase
      .from("listings")
      .upsert({ id, is_active: false }, { onConflict: "id" })
      .select()
      .single();

    if (updateError) return { error: updateError.message };

    setListing(data);
    return { success: true };
  }, [id, user]);

  // ── Restore soft-deleted listing ──────────────────────────
  const restoreListing = useCallback(async () => {
    if (!id) return { error: "No listing ID" };
    if (!user) return { error: "Not authenticated" };

    const { data, error: updateError } = await supabase
      .from("listings")
      .upsert({ id, is_active: true }, { onConflict: "id" })
      .select()
      .single();

    if (updateError) return { error: updateError.message };

    setListing(data);
    return { success: true };
  }, [id, user]);

  // ── Hard delete (row + storage images) ────────────────────
  const hardDeleteListing = useCallback(async () => {
    if (!id) return { error: "No listing ID" };
    if (!user) return { error: "Not authenticated" };

    // Delete storage images first
    if (listing?.images?.length) {
      const { error: storageError } = await supabase.storage
        .from("listing-images")
        .remove(listing.images);

      if (storageError) {
        return { error: `Failed to delete images: ${storageError.message}` };
      }
    }

    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", id);

    if (deleteError) return { error: deleteError.message };

    navigate("/");
    return { success: true };
  }, [id, user, listing, navigate]);

  return {
    listing,
    loading,
    error,
    updateListing,
    softDeleteListing,
    hardDeleteListing,
    restoreListing,
    refreshListing: fetchListing,
  };
}
