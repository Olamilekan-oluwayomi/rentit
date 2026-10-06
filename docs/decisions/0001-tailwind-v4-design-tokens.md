# 0001 — Tailwind v4 `@theme` tokens as the styling foundation

**Status:** Accepted

## Context

RentIt is a marketplace with a lot of repeated surface: listing cards, filter
chips, status badges, dashboard tables. Hand-written CSS duplicated those patterns
and drifted. The first pass integrated Tailwind, then a design system was layered
on top (`108b8bb`, "create design system with 13 UI primitives").

## Decision

Adopt Tailwind CSS v4 and declare every design value — colours, typography,
radii, shadows — as CSS custom properties in the `@theme` block of
`src/index.css`. Utility classes reference those tokens, never raw hex values.
Shared visual components live in `src/design/` and are composed from utilities.

Typography is set in exactly one place: `--font-heading`, `--font-body`, and
`--font-mono` in `@theme`. The `<link>` in `index.html` that loads the matching
Google Fonts families is kept in sync with those three tokens, and the two files
cross-reference each other in comments. (This pairing was silently broken for a
while — `index.css` declared Barlow Condensed while `index.html` loaded Sora, so
every heading silently fell back to a system font. It is now consistent.)

## Consequences

- Restyling the whole app is a change to `@theme`, not a sweep through components.
- Semantic colour names (`bg-surface`, `text-text-muted`) are required, which
  forces dark mode to be handled once per token instead of per component.
- The cost is a hard coupling between `index.css` and `index.html`. They must be
  changed together, which is why the drift above was possible and why both files
  now document the dependency.