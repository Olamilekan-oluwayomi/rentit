# 0006 — Compress images in the browser before upload

**Status:** Accepted

## Context

Listing photos come from phone cameras and would be uploaded at full resolution —
multiple megabytes each, several per listing. Uploading raw originals is slow on
mobile data, slow to upload, and wasteful to store.

## Decision

Resize and re-encode images client-side before they are sent to Supabase Storage:

| Asset | Target | Format |
|-------|--------|--------|
| Listing image | 1200×1200 | JPEG |
| Avatar | 512×512 | JPEG |

The compression happens in the browser, so the bandwidth saving is real and the
originals never leave the device. Supabase Storage holds only the compressed
derivative.

Uploaded files are given unique filenames on upload, because a stable filename
lets a cached URL keep serving a stale image after the user replaces the photo
(`c8c80ec`).

Notification icons are generated with `sharp` in a script rather than committed as
binaries, so regenerating them is reproducible.

## Consequences

- Uploads are far cheaper and listings render faster, which matters because
  listings are image-heavy and the app already lazy-loads images.
- Aspect ratio is not preserved: images are cropped to a square. This keeps the
  grid uniform and is the right call for a listing thumbnail grid, but it would be
  wrong for a product that needs full-fidelity photos.
- Compression is lossy and irreversible from the app's perspective — the original
  is not retained.
- Client-side processing means the compression step is part of the upload path and
  must succeed before the storage call. Failures surface as upload errors rather
  than silently uploading an oversized file.