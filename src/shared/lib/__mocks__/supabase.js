/*
|--------------------------------------------------------------------------
| supabase.js (manual mock)
|--------------------------------------------------------------------------
|
| Vitest manual mock for the Supabase client. Placed in __mocks__ next to
| the real module so vi.mock('../../../shared/lib/supabase') auto-picks it up.
|
| Usage in tests:
|   vi.mock('../../../shared/lib/supabase')
|   import { supabase } from '../../../shared/lib/supabase'
|
|   beforeEach(() => { supabase.__reset() })
|
|   // Configure what .single() resolves to for a given table
|   supabase.__setMockData('availability', { data: [...], error: null })
|
|   // Assert on calls
|   expect(supabase.from).toHaveBeenCalledWith('bookings')
|   expect(supabase.__lastChain().single).toHaveBeenCalled()
|--------------------------------------------------------------------------
*/

const __data = {}

/**
 * Creates a fresh chain builder for a given table name.
 * Each method returns `this` so calls can be chained. Terminal methods
 * (.single, .then) resolve from the __data dictionary.
 */
function createChain(table) {
  let _single = false
  const ch = {
    select: vi.fn(() => ch),
    eq: vi.fn(() => ch),
    order: vi.fn(() => ch),
    in: vi.fn(() => ch),
    neq: vi.fn(() => ch),
    limit: vi.fn(() => ch),
    range: vi.fn(() => ch),
    gte: vi.fn(() => ch),
    lte: vi.fn(() => ch),
    single: vi.fn(() => {
      _single = true
      return Promise.resolve(__data[table] || { data: null, error: null })
    }),
    insert: vi.fn(() => ch),
    "delete": vi.fn(() => ch),
    update: vi.fn(() => ch),
    then: vi.fn((resolve) => {
      let result = __data[table] || { data: null, error: null }
      // Real Supabase: without .single(), data is always an array (or null).
      // With .single(), data is a single row object (or null).
      if (!_single && result && typeof result.data !== 'undefined' && result.data !== null) {
        result = { ...result, data: Array.isArray(result.data) ? result.data : [result.data] }
      }
      Promise.resolve().then(() => resolve(result))
    }),
  }
  return ch
}

/** Build the mock supabase object with .from(), .auth, .storage, and helpers. */
const mockSupabase = {
  // ── Database ──────────────────────────────────────────────────
  from: vi.fn((table) => Object.assign(createChain(table), { __table: table })),

  // ── Auth ──────────────────────────────────────────────────────
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },

  // ── Storage ───────────────────────────────────────────────────
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: { path: 'mock/path.jpg' }, error: null }),
    })),
  },

  // ── Test helpers (not part of the real API) ─────────────────

  /** Configure what data .single() / .then() returns for a table. */
  __setMockData(table, value) {
    __data[table] = value
  },

  /** Clear all mock data and reset all spies. */
  __reset() {
    Object.keys(__data).forEach((k) => delete __data[k])
    vi.clearAllMocks()
  },

  /** Retrieve the most recent chain builder created by .from() for assertions. */
  __lastChain() {
    const calls = this.from.mock.calls
    if (calls.length === 0) return null
    return this.from.mock.results[calls.length - 1].value
  },
}

export { mockSupabase as supabase }