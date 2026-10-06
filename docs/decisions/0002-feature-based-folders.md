# 0002 — Feature-based folders over type-based folders

**Status:** Accepted

## Context

The initial structure grouped files by *kind*: all `components/`, all `hooks/`,
all `pages/`, all `contexts/`. As the app grew, a single feature like bookings was
sliced across five directories, and it was hard to answer "what does the bookings
feature touch?"

## Decision

Restructure so each feature owns its own vertical slice:

```
src/features/<feature>/
├── components/
├── hooks/
└── context/       # only where a feature needs its own provider
```

Directories with no single owning feature stay at the top level — `shared/`
(truly cross-cutting components and contexts), `design/` (the primitive library),
`layouts/`, and `pages/`.

Auth was initially kept at the top level for the same reason — it wraps the whole
app rather than belonging to one feature — but it has since been moved to
`features/auth/`. Its pages, provider, and guards are consumed together, so it now
meets the single-owning-feature test like every other feature.

Feature folders carry a short `README.md` describing what lives there.

## Consequences

- Adding a feature means creating one directory, not touching five.
- A file is correctly placed only if it has exactly one owning feature. Genuinely
  shared pieces have to be argued into `shared/`, which is a useful forcing
  function against premature abstraction.
- The import paths get deeper (`../../features/bookings/hooks/useBookings`), which
  is noisier but keeps the owner visible in the path.