/**
 * Storage URL helpers for Supabase Storage buckets.
 *
 * Supabase stores file references as bucket-relative paths. These
 * helpers resolve those paths into full public URLs that can be used
 * in <img> tags and CSS. If the bucket is private, switch to
 * `createSignedUrl` instead — but the current buckets are public.
 */

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

/**
 * Converts a stored listing image path into a full public URL.
 * @param {string|null} path - The storage path (e.g. "user-id/listing-id/image.jpg")
 * @returns {string|null} The full public URL or null if no path
 */
export function getListingImageUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
  return data.publicUrl;
}
