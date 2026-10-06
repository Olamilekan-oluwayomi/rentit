# Architecture Decision Records

Short notes on the decisions that shaped RentIt. Each record links the reasoning
back to the commits that introduced it, so the claims here can be checked against
`git log` rather than taken on faith.

These records cover decisions that are visible in the repository. Two things are
deliberately *not* recorded as decisions because they are unfinished rather than
chosen: **payouts / earnings** and **analytics** are stubs, and **pricing** is a
placeholder page. Treat the "not yet built" list in the root
[README](../../README.md) as the source of truth for current scope.

| # | Decision | Status |
|---|----------|--------|
| [0001](0001-tailwind-v4-design-tokens.md) | Tailwind v4 `@theme` tokens as the styling foundation | Accepted |
| [0002](0002-feature-based-folders.md) | Feature-based folders over type-based folders | Accepted |
| [0003](0003-supabase-as-backend.md) | Supabase for auth, database, storage, and realtime | Accepted |
| [0004](0004-web-push-via-pg-net-and-vault.md) | Database triggers + pg_net for web push, secrets in Vault | Accepted |
| [0005](0005-motion-with-reduced-motion.md) | `motion` for animation, gated on `prefers-reduced-motion` | Accepted |
| [0006](0006-client-side-image-compression.md) | Compress images in the browser before upload | Accepted |
| [0007](0007-route-level-code-splitting.md) | Lazy-load every route with `React.lazy` | Accepted |
| [0008](0008-testing-strategy.md) | Vitest + Testing Library for units, Playwright for E2E | Accepted |

## Format

Records follow the light ADR shape used by Michael Nygard's template: context,
decision, consequences. They are deliberately short — the goal is to record
*why*, since the *what* is visible in the code.