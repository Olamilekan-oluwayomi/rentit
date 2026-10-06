# 0003 — Supabase as the entire backend

**Status:** Accepted

## Decision

Use Supabase for all server-side capability rather than splitting across services:

| Need | Supabase feature |
|------|------------------|
| Auth (email/password + Google OAuth) | GoTrue |
| Relational data | Postgres, reached through PostgREST |
| Image + avatar files | Storage |
| Live messaging and unread counts | Realtime |
| Row-level security | Postgres RLS policies |
| Background jobs | Edge Functions + `pg_net` |

Security is enforced **in the database** with RLS rather than trusted to the
client. Where the client needs to gate behaviour, the database still has the final
say — see 0004, where approving a booking also writes a row.

## Consequences

- One dependency, one auth model, and one place to reason about permissions.
  Nothing needs to stay in sync across a client and an API server.
- The client can query the database directly, so `supabase.from(...)` appears in
  components. This is a deliberate trade: RLS is the trust boundary, and the
  queries are therefore part of the security surface, not just the data layer.
- Some PostgREST limitations leak into the UI layer. The clearest example is
  embedded-resource filters not reliably filtering parent rows, which forced
  `useBookings` into a two-step fetch (owned listing IDs, then bookings).
- Because the client talks to the database directly, RLS policies have to be
  written to match exactly what each role should see. Several fixes in the history
  are policy corrections of this kind (`4f7fb62` moving listing mutations from
  upsert to UPDATE to satisfy RLS; `c9a206e` allowing `is_active` toggling).