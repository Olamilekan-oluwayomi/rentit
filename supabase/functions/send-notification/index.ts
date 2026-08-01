/*
|--------------------------------------------------------------------------
| send-notification — Supabase Edge Function
|--------------------------------------------------------------------------
|
| Receives Supabase Database Webhook events and delivers Web Push
| notifications to the relevant user via the Web Push protocol
| (VAPID / RFC 8292 authentication + payload encryption).
|
| Events handled (matched on the webhook payload):
|   - bookings INSERT  (status = 'pending')          -> notify the listing owner
|   - bookings UPDATE  (pending -> approved/declined) -> notify the renter
|   - messages INSERT                                -> notify the other participant
|
| Security:
|   - Deployed with --no-verify-jwt. Requests are authenticated with the
|     `x-rentit-webhook-secret` header, compared to the WEBHOOK_SECRET secret.
|   - Reads recipient subscriptions with the service_role key (function env),
|     which bypasses RLS; the client can only manage its own rows.
|
| Deployment:
|   supabase functions deploy send-notification --no-verify-jwt
|
|--------------------------------------------------------------------------
*/

import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildPushHTTPRequest } from "npm:@pushforge/builder@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/* ────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────── */

interface WebhookPayload {
  type?: string;
  table?: string;
  schema?: string;
  record?: Record<string, unknown> | null;
  old_record?: Record<string, unknown> | null;
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  url: string;
}

/* ────────────────────────────────────────────────────────────────────
 * Web Push delivery
 * ──────────────────────────────────────────────────────────────────── */

/**
 * Sends one notification to one subscription. Stale endpoints (404/410 —
 * the browser unregistered or the push service dropped it) are deleted so
 * we don't keep pushing into the void.
 */
async function sendToSubscription(
  row: SubscriptionRow,
  payload: NotificationPayload,
): Promise<void> {
  try {
    const { endpoint, headers, body } = await buildPushHTTPRequest({
      privateJWK: VAPID_PRIVATE_KEY,
      subscription: {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      },
      message: {
        payload,
        adminContact: VAPID_SUBJECT,
        options: { urgency: "high", ttl: 24 * 60 * 60 },
      },
    });

    const response = await fetch(endpoint, { method: "POST", headers, body });

    if (!response.ok) {
      if (response.status === 404 || response.status === 410) {
        console.log(
          `Subscription ${row.id} is stale (${response.status}), deleting.`,
        );
        await deleteSubscription(row.id);
      } else {
        console.error(
          `Push failed (${response.status}) for ${row.endpoint}: ${response.statusText}`,
        );
      }
    }
  } catch (error) {
    // A single bad subscription must never take down the whole batch.
    console.error("Unexpected push error:", error);
  }
}

async function deleteSubscription(id: string): Promise<void> {
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("id", id);
  if (error) console.error("Failed to delete stale subscription:", error.message);
}

/**
 * Delivers a notification to every device subscribed by `userId`.
 * Silently no-ops when the user has no subscriptions.
 */
async function notifyUser(
  userId: string | undefined,
  payload: NotificationPayload,
): Promise<void> {
  if (!userId) return;

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load push subscriptions:", error.message);
    return;
  }
  if (!subscriptions || subscriptions.length === 0) return;

  await Promise.allSettled(
    subscriptions.map((sub) => sendToSubscription(sub, payload)),
  );
}

/* ────────────────────────────────────────────────────────────────────
 * Lookup helpers
 * ──────────────────────────────────────────────────────────────────── */

async function getProfileName(userId: string): Promise<string | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.full_name ?? null;
}

async function getListing(
  listingId: string | undefined,
): Promise<{ owner_id: string; title: string } | null> {
  if (!listingId) return null;
  const { data, error } = await supabase
    .from("listings")
    .select("owner_id, title")
    .eq("id", listingId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatRange(start?: string, end?: string): string {
  if (!start || !end) return "";
  return ` (${formatDate(start)} - ${formatDate(end)})`;
}

/* ────────────────────────────────────────────────────────────────────
 * Event handlers
 * ──────────────────────────────────────────────────────────────────── */

/** New booking request (status 'pending') -> notify the listing owner. */
async function handleBookingInsert(
  record: Record<string, unknown>,
): Promise<void> {
  if (record.status !== "pending") return;

  const listing = await getListing(record.listing_id as string | undefined);
  if (!listing) return;

  const renterName =
    (await getProfileName(record.renter_id as string)) ?? "Someone";
  const dates = formatRange(
    record.start_date as string | undefined,
    record.end_date as string | undefined,
  );

  await notifyUser(listing.owner_id, {
    title: "New booking request",
    body: `${renterName} requested "${listing.title}"${dates}.`,
    url: `/booking/${record.id}`,
  });
}

/** Booking status pending -> approved/declined -> notify the renter. */
async function handleBookingUpdate(
  record: Record<string, unknown>,
  oldRecord: Record<string, unknown> | null,
): Promise<void> {
  const newStatus = record.status as string | undefined;
  const oldStatus = oldRecord?.status as string | undefined;
  if (newStatus !== "approved" && newStatus !== "declined") return;
  if (oldStatus !== "pending") return;

  const listing = await getListing(record.listing_id as string | undefined);
  if (!listing) return;

  const ownerName =
    (await getProfileName(listing.owner_id)) ?? "The owner";
  const approved = newStatus === "approved";

  await notifyUser(record.renter_id as string | undefined, {
    title: approved ? "Booking approved" : "Booking declined",
    body: approved
      ? `${ownerName} approved your request for "${listing.title}".`
      : `${ownerName} declined your request for "${listing.title}".`,
    url: `/booking/${record.id}`,
  });
}

/** New message -> notify the participant who did not send it. */
async function handleMessageInsert(
  record: Record<string, unknown>,
): Promise<void> {
  const bookingId = record.booking_id as string | undefined;
  const senderId = record.sender_id as string | undefined;
  if (!bookingId || !senderId) return;

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("renter_id, listings(owner_id)")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) return;

  const ownerId = booking.listings?.owner_id;
  if (!ownerId) return;

  const recipientId =
    senderId === booking.renter_id ? ownerId : booking.renter_id;
  if (!recipientId || recipientId === senderId) return;

  const senderName = (await getProfileName(senderId)) ?? "Someone";
  const preview = String(record.content ?? "").slice(0, 120);

  await notifyUser(recipientId, {
    title: `${senderName} sent you a message`,
    body: preview,
    url: `/booking/${bookingId}`,
  });
}

/* ────────────────────────────────────────────────────────────────────
 * Request handler
 * ──────────────────────────────────────────────────────────────────── */

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (req.headers.get("x-rentit-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Only public-table events are of interest.
  if (payload.schema !== "public") {
    return new Response("Ignored", { status: 200 });
  }

  try {
    if (payload.table === "bookings" && payload.type === "INSERT") {
      await handleBookingInsert(payload.record ?? {});
    } else if (payload.table === "bookings" && payload.type === "UPDATE") {
      await handleBookingUpdate(payload.record ?? {}, payload.old_record ?? null);
    } else if (payload.table === "messages" && payload.type === "INSERT") {
      await handleMessageInsert(payload.record ?? {});
    }
    // Anything else is deliberately ignored — no notification.
  } catch (error) {
    // The event is already committed; never let a notification failure make
    // the webhook retry (which would duplicate deliveries).
    console.error("send-notification failed:", error);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
