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
