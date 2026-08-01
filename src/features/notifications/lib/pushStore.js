/*
|--------------------------------------------------------------------------
| pushStore.js
|--------------------------------------------------------------------------
|
| Tiny IndexedDB key/value store shared between the app and the service
| worker.
|
| Purpose: Persist the VAPID public key and a Supabase access token so the
|          service worker can re-subscribe and upsert on the rare
|          `pushsubscriptionchange` event. localStorage is NOT available in
|          the service worker scope, hence IndexedDB (same-origin, shared).
| Inputs: (none)
| Outputs: { setPushKey(key, value), getPushKey(key) }
| Side effects: Creates an IndexedDB database on first use
|
|--------------------------------------------------------------------------
*/

const DB_NAME = "rentit-push";
const STORE_NAME = "keys";
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a value under a key in the shared IndexedDB store.
 * Fails silently — push setup must never crash the app.
 *
 * @param {string} key
 * @param {string|null} value
 * @returns {Promise<void>}
 */
export async function setPushKey(key, value) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.warn("pushStore: failed to persist key", key, error);
  }
}

/**
 * Reads a value from the shared IndexedDB store.
 * Returns null when the key is missing or IndexedDB is unavailable.
 *
 * @param {string} key
 * @returns {Promise<string|null>}
 */
export async function getPushKey(key) {
  try {
    const db = await openDb();
    const value = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return value;
  } catch {
    return null;
  }
}
