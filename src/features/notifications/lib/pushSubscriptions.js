/*
|--------------------------------------------------------------------------
| pushSubscriptions.js
|--------------------------------------------------------------------------
|
| Thin wrapper around the browser Push API and the push_subscriptions table.
|
| Purpose: Shared logic used by usePushNotifications and by AuthContext's
|          sign-out cleanup (unsubscribe + remove the DB row before the JWT
|          is invalidated).
| Inputs: (none)
| Outputs: { getCurrentSubscription, upsertSubscription, clearDevicePushSubscription }
| Side effects: PushManager subscriptions, Supabase insert/delete
|
|--------------------------------------------------------------------------
*/

import { supabase } from "../../../shared/lib/supabase";

/**
 * Encodes a subscription key (p256dh / auth) as base64.
 * getKey() returns an ArrayBuffer; the DB stores the base64 form.
 *
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Returns the current device's active PushSubscription, if any.
 *
 * @returns {Promise<PushSubscription|null>}
 */
export async function getCurrentSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

/**
 * Upserts the given subscription into push_subscriptions. The endpoint is
 * unique, so re-subscribing after key rotation replaces the old row.
 * RLS enforces `user_id = auth.uid()`, so the caller's id must match the
 * authenticated user (the INSERT policy rejects rows with a NULL or foreign
 * user_id).
 *
 * @param {PushSubscription} subscription
 * @param {string} userId - The authenticated user's id.
 * @returns {Promise<{ error: Error|null }>}
 */
export async function upsertSubscription(subscription, userId) {
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
        auth: arrayBufferToBase64(subscription.getKey("auth")),
        user_agent: (navigator.userAgent || "").slice(0, 255) || null,
      },
      { onConflict: "endpoint" }
    );

  return { error };
}

/**
 * Removes the current device's subscription: deletes the DB row (RLS
 * scopes it to this user) and unsubscribes from the push service.
 *
 * Called before sign-out, while the JWT is still valid, and by the
 * Settings toggle when disabling notifications.
 *
 * @returns {Promise<void>}
 */
export async function clearDevicePushSubscription() {
  const subscription = await getCurrentSubscription();
  if (!subscription) return;

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", subscription.endpoint);

  try {
    await subscription.unsubscribe();
  } catch (error) {
    // Unsubscribe is best-effort; the DB row is already gone.
    console.warn("pushSubscriptions: unsubscribe failed", error);
  }
}
