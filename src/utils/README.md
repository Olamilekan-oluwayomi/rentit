# Utils — Utility Functions

Pure, stateless utility functions for common operations across the app.

## Available Utilities

### `avatar.js`

Avatar-related helpers for validation and display.

| Function | Purpose |
|----------|---------|
| `validateAvatar(file)` | Validates avatar file MIME type (JPEG/PNG) and size (max 10MB). Returns `{ valid, error? }`. |
| `getInitials(name)` | Extracts initials from a full name (max 2 chars). Returns `"?"` for empty names. |
| `formatFileSize(bytes)` | Formats byte count into human-readable string (`"2.5 MB"`, `"340 B"`). |

### `imageCompression.js`

Browser-side image compression using the Canvas API. No external dependencies.

| Function | Purpose |
|----------|---------|
| `compressImage(file, options?)` | Resizes and re-encodes an image file. Options: `maxWidth` (512), `maxHeight` (512), `quality` (0.8), `outputType` ("image/jpeg"). Returns a `Promise<Blob>`. |

### `location.js`

Geocoding utilities using OpenStreetMap's free Nominatim API.

| Function | Purpose |
|----------|---------|
| `reverseGeocode(lat, lon)` | Reverse-geocodes coordinates to a structured address object. Rate limit: 1 req/sec (Nominatim policy). |
| `formatLocation(address)` | Extracts a "City, Country" string from a Nominatim address object. Falls back through city/town/village/county/state. |

### `storage.js`

Supabase Storage URL resolution helpers.

| Function | Purpose |
|----------|---------|
| `getAvatarUrl(path)` | Resolves a stored avatar path to a full public URL from the `avatars` bucket. |
| `getListingImageUrl(path)` | Resolves a stored listing image path to a full public URL from the `listing-images` bucket. |

## When to Extend

- **Add a new utility** — If the logic is pure, stateless, and used in at least two places, add it here.
- **Don't add React code** — Hooks belong in `src/shared/hooks/` or feature `hooks/` folders.
- **Don't add Supabase queries** — Data access logic belongs in feature hooks, not in utils.
- **Keep functions pure** — No side effects, no React imports, no DOM access (except `imageCompression.js` which uses Canvas API).
- **Document the API** — Each function should have JSDoc comments describing params, return values, and edge cases.
