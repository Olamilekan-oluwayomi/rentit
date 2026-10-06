import { supabase } from "../shared/lib/supabase";

/**
 * Supabase's on-the-fly image transforms (`/render/image/public/`) are only
 * available on paid plans. On the free tier those requests fail, which breaks
 * every image in the app.
 *
 * Transforms are therefore opt-in via `VITE_IMAGE_TRANSFORMS=on` and default to
 * off, so a free-tier project always receives raw public URLs that resolve.
 * Auto-detection is not possible here: the transform endpoint returns an error
 * for a missing object regardless of plan, so probing it cannot distinguish
 * "not supported" from "object absent".
 *
 * If transforms are switched on but unavailable, `handleImageError` recovers
 * each image by retrying against the raw object URL.
 */

/** @returns {boolean} whether transformed URLs should be emitted. */
function transformsEnabled() {
  return import.meta.env.VITE_IMAGE_TRANSFORMS === "on";
}

/**
 * Reverts a render URL to the raw object URL by swapping the path segment and
 * dropping transform query params. Idempotent: a raw URL is returned unchanged.
 *
 * @param {string} url
 * @returns {string}
 */
export function toRawUrl(url) {
  if (!url) return url;

  const [base] = url.split("?");
  return base.replace("/render/image/public/", "/object/public/");
}

/**
 * onError handler for `<img>` elements fed by this module.
 *
 * Retries once against the raw object URL, which resolves regardless of plan or
 * transform support. The retry is guarded by comparing URLs rather than by a
 * one-shot flag, so an element reused across several `src` values (galleries,
 * carousels) still recovers on every image.
 *
 * @param {Event} event
 */
export function handleImageError(event) {
  const img = event?.currentTarget;
  if (!img) return;

  const raw = toRawUrl(img.src);
  // Already pointing at the raw URL, so retrying would not help.
  if (!raw || raw === img.src) return;

  img.src = raw;
}

/**
 * Builds an optimized Supabase Storage image URL using the render endpoint.
 *
 * When transforms are not enabled the raw public URL is returned, so callers
 * always receive a URL that loads.
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
  if (!options || !transformsEnabled()) return publicUrl;

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
 * Resolves an avatar storage path to a public URL.
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
 * Resolves a listing image storage path to a public URL.
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
