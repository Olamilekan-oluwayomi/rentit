-- Web Push delivery via Postgres triggers + pg_net.
--
-- Replaces the dashboard Database Webhooks UI (not available on this
-- project). The triggers fire net.http_post() to the send-notification
-- Edge Function with the same payload shape that function already
-- expects (type / table / schema / record / old_record).
--
-- The webhook secret is NOT hardcoded here. It lives in Supabase Vault
-- (encrypted at rest) under the name 'push_webhook_secret' and is looked
-- up by name at call time. Create it once before this migration is used:
--
--   SELECT vault.create_secret('<WEBHOOK_SECRET>', 'push_webhook_secret');
--
-- The value must be identical to the WEBHOOK_SECRET configured on the
-- send-notification Edge Function. If Vault is unavailable on your plan,
-- see the fallback notes at the bottom of this file.
--
-- Idempotent — safe to run more than once.

-- ─────────────────────────────────────────────────────────────────────
-- 1. Enable Vault (no-op if already enabled).
--    If this line fails on your plan, do not run the rest; tell the
--    project owner to use the settings-table fallback instead.
-- ─────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- ─────────────────────────────────────────────────────────────────────
-- 2. Shared helper: POSTs one event payload to the Edge Function with
--    the Vault-stored secret in the header.
--
--    SECURITY DEFINER + pinned search_path so the Vault lookup and the
--    pg_net call always run as postgres, regardless of which role
--    triggered the statement, and so unqualified names cannot be hijacked.
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

  v_payload := jsonb_build_object(
    'type',        p_type,
    'table',       p_table,
    'schema',      'public',
    'record',      p_record,
    'old_record',  p_old_record
  );

  SELECT net.http_post(
    url     := 'https://wyvjiwlwwemtaintqibv.supabase.co/functions/v1/send-notification',
    body    := v_payload,
    headers := jsonb_build_object(
      'Content-Type',            'application/json',
      'x-rentit-webhook-secret', v_secret
    )
  ) INTO v_job_id;

  RETURN v_job_id;
END;
$$;

-- Only the trigger path (SECURITY DEFINER, runs as postgres) may call the
-- helper. Direct invocation by anon/authenticated roles is denied; the
-- Edge Function still validates the secret header as a second layer.
REVOKE ALL ON FUNCTION public.send_web_push_webhook(TEXT, TEXT, JSONB, JSONB)
  FROM PUBLIC;

-- ─────────────────────────────────────────────────────────────────────
-- 3. Trigger functions (one per event)
-- ─────────────────────────────────────────────────────────────────────

-- New booking request (status = 'pending') -> notify the listing owner.
-- The WHEN clause on the trigger narrows this to pending inserts only.
CREATE OR REPLACE FUNCTION public.notify_booking_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.send_web_push_webhook('INSERT', 'bookings', to_jsonb(NEW), NULL);
  RETURN NULL;
END;
$$;

-- Booking status change (pending -> approved/declined) -> notify the renter.
CREATE OR REPLACE FUNCTION public.notify_booking_status_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.send_web_push_webhook('UPDATE', 'bookings', to_jsonb(NEW), to_jsonb(OLD));
  RETURN NULL;
END;
$$;

-- New message -> notify the other booking participant.
CREATE OR REPLACE FUNCTION public.notify_message_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.send_web_push_webhook('INSERT', 'messages', to_jsonb(NEW), NULL);
  RETURN NULL;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 4. Triggers
-- ─────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_notify_booking_created ON public.bookings;
CREATE TRIGGER trg_notify_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_booking_created();

DROP TRIGGER IF EXISTS trg_notify_booking_status_changed ON public.bookings;
CREATE TRIGGER trg_notify_booking_status_changed
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('approved', 'declined'))
  EXECUTE FUNCTION public.notify_booking_status_changed();

DROP TRIGGER IF EXISTS trg_notify_message_created ON public.messages;
CREATE TRIGGER trg_notify_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_message_created();

-- ─────────────────────────────────────────────────────────────────────
-- Verification (run in the Supabase SQL editor after applying):
--
--   SELECT trigger_name, event_manipulation, action_timing, action_statement
--   FROM   information_schema.triggers
--   WHERE  event_object_table IN ('bookings', 'messages')
--   ORDER  BY event_object_table, trigger_name;
--
-- Expect 3 triggers: trg_notify_booking_created, trg_notify_booking_status_changed,
-- trg_notify_message_created. Then confirm the secret is resolvable:
--
--   SELECT name, decrypted_secret IS NOT NULL AS has_value
--   FROM   vault.decrypted_secrets
--   WHERE  name = 'push_webhook_secret';
--
-- Fallback if Vault is unavailable on the plan:
--   Replace the vault lookup in send_web_push_webhook with a read from a
--   plain app_settings table, e.g.
--     SELECT value INTO v_secret FROM public.app_settings
--      WHERE key = 'webhook_secret';
--   Note the tradeoff: the secret is then stored in plain text at rest in
--   the database instead of encrypted (see project discussion).
-- ─────────────────────────────────────────────────────────────────────
