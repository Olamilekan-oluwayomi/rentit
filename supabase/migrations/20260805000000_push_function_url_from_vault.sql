-- ─────────────────────────────────────────────────────────────────────
-- 20260805000000_push_function_url_from_vault.sql
--
-- Reads the send-notification Edge Function URL from Vault instead of
-- hardcoding it, so the Supabase project ref is never committed to source
-- control and never has to be edited to move between projects.
--
-- Why this is a NEW migration rather than an edit to
-- 20260804000000_webpush_pg_net_triggers.sql:
-- that migration is already recorded in the remote schema_migrations table,
-- so `supabase db push` would skip it. Applied migrations are immutable; any
-- change to the schema or to function bodies must ship as a new file.
--
-- This migration only redefines the webhook helper. The trigger functions
-- from 20260804000000 call the helper by name and are unaffected.
--
-- Before deploying, create the Vault secret (once per project):
--
--   SELECT vault.create_secret(
--     'https://<project-ref>.supabase.co/functions/v1/send-notification',
--     'push_function_url'
--   );
--
-- The secret must already exist for web push to work; note that
-- 20260804000000 introduced a hardcoded URL, so existing projects are
-- currently working without this secret. Set it before applying, or the
-- webhook will be skipped with a NOTICE and notifications will stop.
--
-- Verify after applying:
--
--   SELECT name, decrypted_secret IS NOT NULL AS has_value
--     FROM vault.decrypted_secrets
--    WHERE name IN ('push_webhook_secret', 'push_function_url');
--
-- Expect two rows, both has_value = true.
--
-- Idempotent — safe to run more than once.
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- Shared helper: POSTs one event payload to the Edge Function with the
-- Vault-stored secret in the header.
--
-- SECURITY DEFINER + pinned search_path so the Vault lookups and the pg_net
-- call always run as postgres, regardless of which role triggered the
-- statement, and so unqualified names cannot be hijacked.
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.send_web_push_webhook(
  p_type        TEXT,
  p_table       TEXT,
  p_record      JSONB,
  p_old_record  JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_secret   TEXT;
  v_url      TEXT;
  v_payload  JSONB;
  v_job_id   BIGINT;
BEGIN
  SELECT decrypted_secret
    INTO v_secret
    FROM vault.decrypted_secrets
   WHERE name = 'push_webhook_secret';

  IF v_secret IS NULL OR v_secret = '' THEN
    RAISE NOTICE 'send_web_push_webhook: vault secret "push_webhook_secret" is not set; skipping';
    RETURN NULL;
  END IF;

  -- The Edge Function base URL is read from Vault rather than hardcoded so
  -- that the Supabase project ref is never committed to source control.
  -- Rotate it by updating this secret; no code change required.
  SELECT decrypted_secret
    INTO v_url
    FROM vault.decrypted_secrets
   WHERE name = 'push_function_url';

  IF v_url IS NULL OR v_url = '' THEN
    RAISE NOTICE 'send_web_push_webhook: vault secret "push_function_url" is not set; skipping';
    RETURN NULL;
  END IF;

  v_payload := jsonb_build_object(
    'type',        p_type,
    'table',       p_table,
    'schema',      'public',
    'record',      p_record,
    'old_record',  p_old_record
  );

  SELECT net.http_post(
    url     := v_url,
    body    := v_payload,
    headers := jsonb_build_object(
      'Content-Type',            'application/json',
      'x-rentit-webhook-secret', v_secret
    )
  ) INTO v_job_id;

  RETURN v_job_id;
END;
$$;

-- Re-asserted defensively. 20260804000000 already revoked this, and CREATE
-- OR REPLACE FUNCTION preserves the existing privileges, so this is a no-op on
-- a correctly migrated database — but it keeps the security posture declared
-- next to the body that implements it.
REVOKE ALL ON FUNCTION public.send_web_push_webhook(TEXT, TEXT, JSONB, JSONB)
  FROM PUBLIC;