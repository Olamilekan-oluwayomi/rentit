/*
|--------------------------------------------------------------------------
| useProfile.js
|--------------------------------------------------------------------------
|
| Manages the authenticated user's profile data.
|
| Purpose: Wraps Supabase CRUD for profiles table and avatars storage bucket.
| Inputs: (none — uses useAuth + useProfileContext internally)
| Outputs: { profile, saving, uploading, error, updateProfile, uploadAvatar, deleteAvatar, refreshProfile }
| Side effects: Supabase queries/mutations; storage upload/remove; image compression
|
|--------------------------------------------------------------------------
*/

import { useCallback, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { useProfileContext } from "../context/ProfileContext";
import { supabase } from "../../../shared/lib/supabase";
import { compressImage } from "../../../utils/imageCompression";

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
   * The file is compressed to 512×512 JPEG before uploading to keep
   * storage sizes small and load times fast. The file is stored at
   * `<user-id>/avatar.jpg` with upsert so each user always has exactly
   * one avatar. After the storage upload succeeds, the profile row is
   * updated to point to the new path.
   *
   * @param {File} file - Image file selected by the user
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
  const uploadAvatar = useCallback(
    async (file) => {
      if (!user) return { error: "Not authenticated" };
      setUploading(true);
      setError(null);

      let compressed;
      try {
        compressed = await compressImage(file);
      } catch (err) {
        setError(err.message);
        setUploading(false);
        return { error: err.message };
      }

      // Deterministic path per user — upsert replaces any previous avatar
      const filePath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressed, { upsert: true });

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
