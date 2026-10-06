# 0008 — Vitest + Testing Library for units, Playwright for E2E

**Status:** Accepted

## Context

Test infrastructure was added part-way through the build, after a batch of
regressions had already shipped — several of them the kind that only a browser
catches: a stray closing `div` causing a 500, a blank page from an undefined route,
a form control with no `htmlFor`/`id` pairing.

## Decision

Two layers, each for what it is actually good at:

**Vitest + Testing Library + jsdom** for unit and integration tests. Components
are rendered for real and asserted through the DOM by accessible role and label, not
by inspecting props or state. These run in `npm test` (`vitest` in watch mode
locally; CI uses `npx vitest run` for a single non-watching pass).

**Playwright** for end-to-end tests in `src/test/e2e/`, excluded from the Vitest
run. These are slower and browser-dependent, so they are a separate command
(`npm run test:e2e`) rather than part of the fast loop.

### Hermetic tests

`createClient` throws at module load when the Supabase URL and key are missing, so
a checkout without a `.env` file failed to collect two suites. `vite.config.js` now
supplies placeholder values under `test.env`, which makes `npx vitest run` behave
identically on a laptop and in CI. No suite needs real credentials, and suites that
care about data mock `shared/lib/supabase` through the manual mock in
`src/shared/lib/__mocks__/supabase.js`.

### What the tests target

Tests are written around behaviour that is easy to break silently, not for coverage
numbers. Current examples:

- `useBookings` — that each view type applies the right query filters, so a change
  to the owner two-step fetch cannot silently return the wrong bookings.
- `useReviewEligibility` — that a review cannot be left before the rental ends or
  on a booking that was never approved.
- `DashboardBookings` — that approving and declining go through confirmation and
  write the right status, and that approving also blocks the listing's calendar.

## Consequences

- The fast suite runs in about 12 seconds and needs no environment or credentials,
  so it can be required on every push. That constraint is what CI enforces.
- Mocking Supabase at the module boundary means these tests do not catch RLS or
  schema mismatches. A query can pass its test and still be rejected by the
  database. This is the real coverage gap and it needs a project with a disposable
  Supabase instance to close.
- Asserting on roles and labels rather than markup makes tests survive restyling
  but means accessibility regressions *can* still slip through — the assertion is
  satisfied by whatever is currently exposed.