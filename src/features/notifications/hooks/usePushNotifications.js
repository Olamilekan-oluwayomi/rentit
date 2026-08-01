/*
|--------------------------------------------------------------------------
| usePushNotifications.js
|--------------------------------------------------------------------------
|
| Enables / disables Web Push notifications for the current device.
|
| Purpose: Wraps the Push API + push_subscriptions table in a single hook
|          used by the Settings toggle and the dashboard opt-in banner.
| Inputs: (none — uses useAuth internally for the session)
| Outputs: { supported, permission, enabled, loading, enable, disable }
| Side effects: Notification.requestPermission(), PushManager.subscribe()/
|               unsubscribe(), Supabase insert/delete on push_subscriptions,
|               IndexedDB key persistence for the service worker
|
|--------------------------------------------------------------------------
*/

import { useCallback, useEffect, useState } from "react";
import { supabase, urlBase64ToUint8Array } from "../../../shared/lib/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import {
  clearDevicePushSubscription,
  getCurrentSubscription,
  upsertSubscription,
} from "../lib/pushSubscriptions";
import { setPushKey } from "../lib/pushStore";

export function usePushNotifications() {
  const { user } = useAuth();

  // The Push API is only available in secure contexts (HTTPS / localhost).
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const [permission, setPermission] = useState(
    supported ? Notification.permission : "denied"
  );
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Keep `permission` in sync when it changes (granted/denied/default).
  // The Notification API has no change event to subscribe to; the
  // Permissions API does, and we use it where available. When it isn't
  // (e.g. Firefox throws on `query({ name: "notifications" })`) we fall
  // back to a one-time read — enable()/disable() keep the state fresh
  // for changes initiated in-app.
  useEffect(() => {
    if (!supported) return;

    let permissionStatus = null;
    let onPermissionChange = null;
    let cancelled = false;

    Promise.resolve().then(() => setPermission(Notification.permission));

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "notifications" })
        .then((result) => {
          if (cancelled) return;
          permissionStatus = result;
          onPermissionChange = () => setPermission(Notification.permission);
          permissionStatus.addEventListener("change", onPermissionChange);
        })
        .catch(() => {
          // Notifications not queryable (e.g. Firefox) — one-time read only.
        });
    }

    return () => {
      cancelled = true;
      if (permissionStatus && onPermissionChange) {
        permissionStatus.removeEventListener("change", onPermissionChange);
      }
    };
  }, [supported]);

  // Reflect whether this device is currently subscribed.
  useEffect(() => {
    if (!supported || !user) {
      Promise.resolve().then(() => setEnabled(false));
      return;
    }
    let cancelled = false;
    getCurrentSubscription().then((subscription) => {
      if (!cancelled) setEnabled(Boolean(subscription));
    });
    return () => {
      cancelled = true;
    };
  }, [supported, user]);

  /**
   * Requests permission, subscribes this device, and stores the row.
   * Also persists the VAPID key + access token to IndexedDB so the service
   * worker can re-subscribe and upsert on pushsubscriptionchange.
   *
   * @returns {Promise<{ error: Error|null }>}
   */
  const enable = useCallback(async () => {
    if (!supported) {
      return { error: new Error("Push notifications are not supported in this browser.") };
    }
    if (!user) {
      return { error: new Error("Sign in to enable notifications.") };
    }

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        return { error: new Error("Notifications permission was denied.") };
      }

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
      }
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        console.log("[push] VITE_VAPID_PUBLIC_KEY =", JSON.stringify(vapidPublicKey));
        if (!vapidPublicKey) {
          throw new Error(
            "VITE_VAPID_PUBLIC_KEY is missing from the environment. " +
              "Add it to .env and restart the dev server."
          );
        }
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        console.log(
          "[push] applicationServerKey length:",
          applicationServerKey.length,
          "(valid P-256 = 65)"
        );
        if (applicationServerKey.length !== 65) {
          throw new Error(
            "Invalid VAPID public key (" +
              applicationServerKey.length +
              " bytes). Check VITE_VAPID_PUBLIC_KEY in .env."
          );
        }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      const { error } = await upsertSubscription(subscription, user.id);
      if (error) throw error;

      // Persist for the service worker's pushsubscriptionchange handler
      // (SW scope has no access to import.meta.env or localStorage).
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await setPushKey("vapid_public_key", import.meta.env.VITE_VAPID_PUBLIC_KEY);
      await setPushKey("supabase_url", import.meta.env.VITE_SUPABASE_URL);
      await setPushKey("anon_key", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
      await setPushKey("access_token", session?.access_token ?? null);

      setEnabled(true);
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  }, [supported, user]);

  /**
   * Unsubscribes this device and removes its DB row.
   *
   * @returns {Promise<{ error: Error|null }>}
   */
  const disable = useCallback(async () => {
    if (!supported) return { error: null };

    setLoading(true);
    try {
      await clearDevicePushSubscription();
      setEnabled(false);
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  }, [supported]);

  return { supported, permission, enabled, loading, enable, disable };
}
