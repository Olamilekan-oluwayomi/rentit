/* global clients */

/*
|--------------------------------------------------------------------------
| sw.js — RentIt push notification service worker
|--------------------------------------------------------------------------
|
| Handles three events:
|   - push:                display a notification from the webhook payload
|                          (title/body/url, delivered by send-notification).
|   - notificationclick:   focus an open window, navigate it to the booking,
|                          or open a new tab for the notification's URL.
|   - pushsubscriptionchange: the push service rotated keys or dropped our
|                          subscription — re-subscribe and upsert the new
|                          endpoint into push_subscriptions.
|
| The service worker scope has NO access to localStorage or import.meta.env,
| so it reads the VAPID public key, Supabase URL/anon key, and the user's
| access token from the shared IndexedDB store written by
| src/features/notifications/lib/pushStore.js.
|
|--------------------------------------------------------------------------
*/

/* ── Lifecycle ─────────────────────────────────────────────────────── */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

/* ── Helpers (self-contained copies; no imports in a classic worker) ── */

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function openPushDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("rentit-push", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getPushKey(key) {
  try {
    const db = await openPushDb();
    const value = await new Promise((resolve, reject) => {
      const tx = db.transaction("keys", "readonly");
      const request = tx.objectStore("keys").get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return value;
  } catch {
    return null;
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Extracts the user id from a Supabase JWT (the `sub` claim), which the
 * push_subscriptions INSERT policy requires to match auth.uid().
 */
function jwtUserId(token) {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return json.sub || null;
  } catch {
    return null;
  }
}

/* ── push — display a notification ─────────────────────────────────── */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.warn("sw: failed to parse push payload", error);
  }

  const title = data.title || "RentIt";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/* ── notificationclick — focus / navigate / open the target URL ────── */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = new URL(event.notification.data?.url || "/", self.location.origin);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const matching = windowClients.find((client) => client.url === target.href);
      if (matching) return matching.focus();

      if (windowClients.length > 0) {
        return windowClients[0].navigate(target.href).then((client) => client?.focus?.());
      }

      return clients.openWindow(target.href);
    })
  );
});

/* ── pushsubscriptionchange — re-subscribe and upsert ──────────────── */

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(resubscribeAndSync());
});

async function resubscribeAndSync() {
  try {
    const vapidKey = await getPushKey("vapid_public_key");
    const token = await getPushKey("access_token");
    const supabaseUrl = await getPushKey("supabase_url");
    const anonKey = await getPushKey("anon_key");

    if (!vapidKey || !token || !supabaseUrl || !anonKey) {
      console.warn("sw: missing push store keys, skipping re-subscribe");
      return;
    }

    const subscription = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    const userId = jwtUserId(token);
    if (!userId) {
      console.warn("sw: could not decode user id from token");
      return;
    }

    const payload = {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
      auth: arrayBufferToBase64(subscription.getKey("auth")),
      user_agent: null,
    };

    const response = await fetch(
      `${supabaseUrl}/rest/v1/push_subscriptions?on_conflict=endpoint`,
      {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.warn("sw: upsert push subscription failed", response.status);
    }
  } catch (error) {
    console.warn("sw: pushsubscriptionchange failed", error);
  }
}
