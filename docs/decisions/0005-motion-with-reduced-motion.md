# 0005 — `motion` for animation, gated on `prefers-reduced-motion`

**Status:** Accepted

## Context

The product polish passes added micro-interactions throughout: staggered list
entrances, page transitions, toast slide-in, button press feedback, scroll
reveal. Hand-rolling these in CSS meant one animation system per component and no
shared way to respect reduced-motion preferences.

## Decision

Use the `motion` library for animations that need orchestration — enter/exit,
staggering, layout transitions — and keep plain CSS keyframes for simple
one-shot utilities (`animate-fade-in`, `animate-scale-in`, `animate-slide-up`).

Everything animated must respect `prefers-reduced-motion: reduce`:

- **Motion components** call the `useReducedMotion()` hook and skip the
  animation. `ToastContext` does this — it renders `initial={false}` so a toast
  appears immediately with no transition.
- **CSS keyframes** cannot react to a hook, so `src/index.css` neutralises the
  utility classes inside a `@media (prefers-reduced-motion: reduce)` block.

Disabling a CSS animation drops the element at its natural end state — opacity 1,
no transform — rather than freezing it part-way through the keyframes, so nothing
is left invisible.

Scroll behaviour is handled in the same block: `scroll-behavior` falls back from
`smooth` to `auto`.

## Consequences

- Motion is a real runtime dependency rather than an optional polish layer.
- There are two animation systems, and the boundary between them is a judgement
  call. The rule used: orchestration goes to `motion`, single CSS transitions stay
  in CSS.
- The CSS block is easy to forget when adding a new keyframe utility — a new
  `animate-*` class that is not listed there will animate regardless of the user's
  preference. Listing them explicitly keeps that failure visible at the definition
  site.
- Only the keyframe utilities are covered. Per-component `transition-*` utilities
  (colour, opacity, transform on hover) are left alone, on the basis that they are
  small and not motion in the vestibular sense.