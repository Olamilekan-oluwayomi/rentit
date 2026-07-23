import { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProfileContext } from "../contexts/ProfileContext";
import { supabase } from "../lib/supabase";

export function useProfile() {
  const { user } = useAuth();
  const { profile, setProfile, refreshProfile } = useProfileContext();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return { error: "Not authenticated" };
      setSaving(true);
      setError(null);

      const trimmed = {};
      if (updates.full_name !== undefined) trimmed.full_name = updates.full_name.trim();
      if (updates.location !== undefined) trimmed.location = updates.location.trim();
      if (updates.bio !== undefined) trimmed.bio = updates.bio.trim();

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

      setProfile(data);
      setSaving(false);
      return { success: true };
    },
    [user, setProfile]
  );

  const uploadAvatar = useCallback(
    async (file) => {
      if (!user) return { error: "Not authenticated" };
      setUploading(true);
      setError(null);

      const filePath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        return { error: uploadError.message };
      }

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

  const deleteAvatar = useCallback(async () => {
    if (!user) return { error: "Not authenticated" };
    setSaving(true);
    setError(null);

    if (profile?.avatar_url) {
      await supabase.storage.from("avatars").remove([profile.avatar_url]);
    }

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
