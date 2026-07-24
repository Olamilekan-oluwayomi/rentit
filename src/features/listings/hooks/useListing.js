/**
 * Hook for managing a single listing's lifecycle.
 *
 * Provides CRUD operations scoped to one listing ID: fetch, update,
 * soft-delete, restore, and hard-delete. Hard-delete also cleans up
 * associated images in Supabase Storage before removing the DB row,
 * and redirects the user to the home page via React Router.
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { supabase } from "../../../shared/lib/supabase";

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

  // Auto-fetch when the component mounts or the listing ID changes
  useEffect(() => {
    (async () => {
      await fetchListing();
    })();
  }, [fetchListing]);

  // ── Update listing fields ─────────────────────────────────
  /**
   * Merges arbitrary field updates into the listing row via upsert.
   *
   * @param {object} updates - Partial listing object (e.g. title, daily_price)
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
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
  /**
   * Hides a listing from the marketplace without permanently removing it.
   * The owner can still view and restore soft-deleted listings.
   *
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
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
  /**
   * Re-activates a previously soft-deleted listing so it reappears
   * in marketplace searches.
   *
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
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
  /**
   * Permanently deletes a listing and its images from Supabase Storage.
   * Storage cleanup happens first so we don't leave orphaned files
   * if the DB delete later fails. After deletion, navigates to "/".
   *
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
  const hardDeleteListing = useCallback(async () => {
    if (!id) return { error: "No listing ID" };
    if (!user) return { error: "Not authenticated" };

    // Delete storage images first to avoid orphaned files
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

    // Redirect away from the now-deleted listing page
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
