import { supabase } from "../shared/lib/supabase";

/**
 * Builds an optimized Supabase Storage image URL using the render endpoint.
 *
 * Supabase's render endpoint serves transformed images on-the-fly with
 * caching. By converting the public object URL to a render URL and adding
 * resize + format params we avoid sending multi-megabyte originals to the
 * browser and serve appropriately sized WebP images instead.
 *
 * @param {string}  publicUrl  - The base public URL from getPublicUrl().
 * @param {object}  [options]  - Transform options. Omit or pass null for the raw URL.
 * @param {number}  [options.width]
 * @param {number}  [options.height]
 * @param {string}  [options.resize="cover"]  - "cover" | "contain" | "fill"
 * @param {string}  [options.format="webp"]   - "webp" | "avif" | "origin"
 * @param {number}  [options.quality=80]      - 1 – 100
 * @returns {string} The rendered/raw public URL.
 */
function toRenderUrl(publicUrl, options) {
  if (!options) return publicUrl;

  const renderUrl = publicUrl.replace(
    "/object/public/",
    "/render/image/public/"
  );

  const params = new URLSearchParams();
  if (options.width) params.set("width", options.width);
  if (options.height) params.set("height", options.height);
  if (options.width || options.height) {
    params.set("resize", options.resize || "cover");
  }
  params.set("format", options.format || "webp");
  params.set("quality", String(options.quality ?? 80));

  return `${renderUrl}?${params.toString()}`;
}

/**
 * Resolves an avatar storage path to an optimized public URL.
 *
 * @param {string|null}  path    - Storage path e.g. "user-id/avatar.jpg"
 * @param {object}       [opts]  - Transform options (width, height, format, etc.)
 * @returns {string|null}
 */
export function getAvatarUrl(path, opts) {
  if (!path) return null;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return toRenderUrl(data.publicUrl, opts);
}

/**
 * Resolves a listing image storage path to an optimized public URL.
 *
 * @param {string|null}  path    - Storage path e.g. "user-id/listing-id/img.jpg"
 * @param {object}       [opts]  - Transform options (width, height, format, etc.)
 * @returns {string|null}
 */
export function getListingImageUrl(path, opts) {
  if (!path) return null;
  const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
  return toRenderUrl(data.publicUrl, opts);
}
