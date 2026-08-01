/**
 * Converts a base64url-encoded string (e.g. a VAPID public key) into a
 * Uint8Array, which is the format PushManager.subscribe() expects for
 * `applicationServerKey`.
 *
 * @param {string} base64String - base64url string, no padding required.
 * @returns {Uint8Array}
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Supabase client singleton.
 *
 * Initialises the Supabase JS client using environment variables and
 * exports a single shared instance consumed throughout the app.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/**
 * Shared Supabase client instance.
 *
 * - persistSession: true   — tokens survive page reloads via localStorage
 * - autoRefreshToken: true — refreshes the JWT before it expires
 * - eventsPerSecond: 10    — rate-limit for the realtime websocket
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})
