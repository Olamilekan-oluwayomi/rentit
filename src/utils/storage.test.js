/*
 * storage — Tests the image URL fallbacks that keep images loading when
 * Supabase's paid-only /render/image/ transform endpoint is unavailable.
 *
 * The regression these guard: an earlier fallback guarded retries with a
 * one-shot DOM flag. Galleries reuse a single <img> across several `src`
 * values, so only the first image recovered and the rest stayed broken.
 * The retry is now guarded by comparing URLs, so it must fire once per src.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../shared/lib/supabase', () => ({
  supabase: {
    storage: {
      from: (bucket) => ({
        getPublicUrl: (path) => ({
          data: { publicUrl: `https://cdn.test/storage/v1/object/public/${bucket}/${path}` },
        }),
      }),
    },
  },
}))

import { toRawUrl, handleImageError, getListingImageUrl } from './storage'

const RENDER_URL =
  'https://cdn.test/storage/v1/render/image/public/listing-images/u/l/a.jpg?width=960&height=540&format=webp'
const OBJECT_URL =
  'https://cdn.test/storage/v1/object/public/listing-images/u/l/a.jpg'

/** Minimal stand-in for the properties handleImageError reads. */
function makeImg(src) {
  return { src }
}

describe('toRawUrl', () => {
  it('swaps the render path for the object path and drops params', () => {
    expect(toRawUrl(RENDER_URL)).toBe(OBJECT_URL)
  })

  it('returns an already-raw URL unchanged', () => {
    expect(toRawUrl(OBJECT_URL)).toBe(OBJECT_URL)
  })

  it('leaves URLs from other hosts untouched', () => {
    const external = 'https://example.com/photo.jpg?width=10'
    expect(toRawUrl(external)).toBe('https://example.com/photo.jpg')
  })

  it('passes through empty input', () => {
    expect(toRawUrl(null)).toBeNull()
  })
})

describe('handleImageError', () => {
  it('retries a failed transform URL against the raw object URL', () => {
    const img = makeImg(RENDER_URL)
    handleImageError({ currentTarget: img })
    expect(img.src).toBe(OBJECT_URL)
  })

  it('is idempotent: a raw URL that fails is left alone', () => {
    const img = makeImg(OBJECT_URL)
    handleImageError({ currentTarget: img })
    expect(img.src).toBe(OBJECT_URL)
  })

  it('recovers every image when one element is reused across src values', () => {
    const img = makeImg(RENDER_URL)
    handleImageError({ currentTarget: img })
    expect(img.src).toBe(OBJECT_URL)

    // Gallery advances to the next photo; the same <img> node is reused.
    const second = `${OBJECT_URL.replace('a.jpg', 'b.jpg')}?width=960&format=webp`
    img.src = second
    handleImageError({ currentTarget: img })
    expect(img.src).toBe(OBJECT_URL.replace('a.jpg', 'b.jpg'))
  })

  it('tolerates a missing event target', () => {
    expect(() => handleImageError({})).not.toThrow()
    expect(() => handleImageError()).not.toThrow()
  })
})

describe('getListingImageUrl', () => {
  const original = import.meta.env.VITE_IMAGE_TRANSFORMS

  beforeEach(() => {
    import.meta.env.VITE_IMAGE_TRANSFORMS = 'off'
  })

  afterEach(() => {
    import.meta.env.VITE_IMAGE_TRANSFORMS = original
  })

  it('returns the raw object URL when transforms are disabled', () => {
    expect(getListingImageUrl('u/l/a.jpg', { width: 960 })).toBe(OBJECT_URL)
  })

  it('returns the raw object URL when no options are passed', () => {
    expect(getListingImageUrl('u/l/a.jpg')).toBe(OBJECT_URL)
  })

  it('returns null for an empty path', () => {
    expect(getListingImageUrl(null)).toBeNull()
    expect(getListingImageUrl(undefined)).toBeNull()
  })

  it('builds a transform URL when explicitly enabled', () => {
    import.meta.env.VITE_IMAGE_TRANSFORMS = 'on'
    const url = getListingImageUrl('u/l/a.jpg', { width: 960, height: 540 })
    expect(url).toContain('/render/image/public/')
    expect(url).toContain('width=960')
    expect(url).toContain('format=webp')
    // The onError fallback can always recover from it.
    expect(toRawUrl(url)).toBe(OBJECT_URL)
  })
})