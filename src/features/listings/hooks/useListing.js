/*
|--------------------------------------------------------------------------
| useListing.js
|--------------------------------------------------------------------------
|
| Manages a single listing's lifecycle (CRUD operations).
|
| Purpose: Fetch, update, soft-delete, restore, and hard-delete a listing.
| Inputs: id (string|null)
| Outputs: { listing, loading, error, updateListing, softDeleteListing, hardDeleteListing, restoreListing, refreshListing }
| Side effects: Supabase queries/mutations; storage cleanup; navigate on hard delete
|
|--------------------------------------------------------------------------
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
      .select("*, owner:owner_id(id, full_name, avatar_url, location, bio, created_at, average_rating, rating_count)")
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
  /**
   * Merges arbitrary field updates into the listing row.
   * Uses a plain UPDATE (not upsert) so the row is only ever modified via
   * the UPDATE RLS policy. An upsert payload would omit owner_id and fail
   * the INSERT policy's WITH CHECK (owner_id = auth.uid()) even for
   * existing rows.
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
        .update(updates)
        .eq("id", id)
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
      .update({ is_active: false })
      .eq("id", id)
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
      .update({ is_active: true })
      .eq("id", id)
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
