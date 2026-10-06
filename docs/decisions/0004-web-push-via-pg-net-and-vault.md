# 0004 — Web push via database triggers + `pg_net`, with secrets in Vault

**Status:** Accepted

## Context

RentIt notifies users about booking requests, booking status changes, and new
messages. A Postgres database has no way to make outbound HTTPS requests, so the
obvious design — the browser or the Edge Function polls for changes — means either
a constant stream of requests or an untrusted client driving notifications.

## Decision

Deliver notifications from the database, not the browser:

1. `push_subscriptions` stores each device's VAPID endpoint and keys, unique per
   `(user_id, endpoint)`.
2. Postgres triggers on `bookings` and `messages` call notification functions.
3. Those functions use `pg_net` to `net.http_post` the `send-notification` Edge
   Function.
4. The Edge Function fans out with the Web Push protocol, prunes endpoints that
   return 404/410, and subscribes to `pushsubscriptionchange`.

### Secrets in Vault, not in the migration

The original migration hardcoded both the webhook secret and the Supabase project
URL into the SQL file. That published the project ref and meant rotating the secret
required a code change and a migration.

Both values now live in Supabase Vault (`vault.create_secret`), encrypted at rest,
and the function resolves them at send time:

| Vault secret | Used for |
|--------------|----------|
| `push_webhook_secret` | Must match the function's `WEBHOOK_SECRET` |
| `push_function_url` | The function base URL |

Two consequences of holding the URL in Vault: it is no longer in the repository,
and it is no longer in the git history either. The project ref in earlier commits
is still retrievable from history — that was a deliberate decision not to rewrite
published history.

The function is deployed with `--no-verify-jwt` and authenticates callers with an
`x-rentit-webhook-secret` header instead, since a JWT check would fail for a
`pg_net` request that has no user session.

The triggers **skip with a `RAISE NOTICE` when either secret is unset** rather
than raising an error. A missing configuration should not make every insert to
`bookings` fail — it should make notifications silently stop, which is the correct
failure mode for a notification side-effect.

## Consequences

- Notifications fire regardless of whether anyone has the app open.
- Delivery is at-least-once and best-effort. Nothing retries a failed fan-out, and
  a rejected endpoint is pruned only once a 404/410 proves it dead.
- Vault requires a plan that supports it. The migration documents the fallback —
  reading the values from a plain `app_settings` table instead — and states the
  tradeoff out loud: the secret is then stored in plain text at rest.
- Two secrets must be created by hand after applying the migration, so a fresh
  project silently has push disabled until both are set. The verification SQL at
  the bottom of the migration checks for exactly that.