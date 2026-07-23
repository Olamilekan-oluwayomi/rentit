import { supabase } from "../lib/supabase";

/**
 * Converts a stored avatar path into a full public URL.
 * @param {string|null} path - The storage path (e.g. "user-id/avatar.jpg")
 * @returns {string|null} The full public URL or null if no path
 */
export function getAvatarUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
