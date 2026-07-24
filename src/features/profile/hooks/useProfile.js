/**
 * Hook for managing the authenticated user's profile data.
 *
 * Wraps Supabase reads/writes for the `profiles` table and the `avatars`
 * storage bucket, exposing simple async helpers for the rest of the app.
 * Profile state is shared globally through ProfileContext — this hook
 * simply provides convenient accessors that keep local loading / error
 * states in sync with those global updates.
 */

import { useCallback, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { useProfileContext } from "../context/ProfileContext";
import { supabase } from "../../../shared/lib/supabase";

export function useProfile() {
  const { user } = useAuth();
  const { profile, setProfile, refreshProfile } = useProfileContext();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Persists profile field updates (name, location, bio) to Supabase.
   * Trims whitespace on string fields before writing to avoid accidental
   * leading/trailing spaces. Uses upsert so it creates the row if it
   * doesn't exist yet (e.g. first-time signup).
   *
   * @param {object} updates - Partial profile object with any of full_name, location, bio
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return { error: "Not authenticated" };
      setSaving(true);
      setError(null);

      // Trim string fields to prevent accidental whitespace in stored data
      const trimmed = {};
      if (updates.full_name !== undefined) trimmed.full_name = updates.full_name.trim();
      if (updates.location !== undefined) trimmed.location = updates.location.trim();
      if (updates.bio !== undefined) trimmed.bio = updates.bio.trim();

      // Upsert ensures the profile row exists; onConflict targets the PK
      const { data, error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...trimmed }, { onConflict: "id" })
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return { error: updateError.message };
      }

      // Push updated profile into global context so all consumers re-render
      setProfile(data);
      setSaving(false);
      return { success: true };
    },
    [user, setProfile]
  );

  /**
   * Uploads a new avatar image and links it to the user's profile.
   * The file is stored at `<user-id>/avatar.jpg` with upsert so each
   * user always has exactly one avatar. After the storage upload
   * succeeds, the profile row is updated to point to the new path.
   *
   * @param {File} file - Image file selected by the user
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
  const uploadAvatar = useCallback(
    async (file) => {
      if (!user) return { error: "Not authenticated" };
      setUploading(true);
      setError(null);

      // Deterministic path per user — upsert replaces any previous avatar
      const filePath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        return { error: uploadError.message };
      }

      // Link the uploaded file path into the profile row
      const { data, error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url: filePath }, { onConflict: "id" })
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        setUploading(false);
        return { error: updateError.message };
      }

      setProfile(data);
      setUploading(false);
      return { success: true };
    },
    [user, setProfile]
  );

  /**
   * Removes the user's avatar from storage and clears the reference
   * in the profile row. The storage file is removed first so we don't
   * end up with an orphaned file if the DB update succeeds.
   *
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
  const deleteAvatar = useCallback(async () => {
    if (!user) return { error: "Not authenticated" };
    setSaving(true);
    setError(null);

    // Only attempt storage removal if an avatar currently exists
    if (profile?.avatar_url) {
      await supabase.storage.from("avatars").remove([profile.avatar_url]);
    }

    // Clear the avatar_url column so the UI falls back to initials
    const { data, error: updateError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, avatar_url: null }, { onConflict: "id" })
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return { error: updateError.message };
    }

    setProfile(data);
    setSaving(false);
    return { success: true };
  }, [user, profile, setProfile]);

  return {
    profile,
    saving,
    uploading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refreshProfile,
  };
}
