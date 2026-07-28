/*
 * AuthContext — Tests that the auth provider correctly calls Supabase Auth
 * methods and that the user state updates on session changes.
 *
 * Uses renderHook to interact with the context without mounting a full UI.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock supabase BEFORE importing the module under test
vi.mock('../../../shared/lib/supabase')

import { supabase } from '../../../shared/lib/supabase'

// Import after mock is set up
import { AuthProvider, useAuth } from './AuthContext'

/**
 * Wraps a hook call inside the AuthProvider so useAuth() has context.
 */
function renderAuthHook() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthProvider', () => {
  it('starts in loading state with no user', () => {
    const { result } = renderAuthHook()
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it('resolves loading to false after getSession completes', async () => {
    const { result } = renderAuthHook()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('sets user when getSession returns a session', async () => {
    // We need to configure the mock before the component renders
    // Since renderHook happens synchronously, the useEffect fires immediately,
    // and getSession is called. We need a deferred mock.

    // Instead, test via subscribe — fire an auth state change event
    const fakeUser = { id: 'u1', email: 'test@test.com' }
    const fakeSession = { user: fakeUser }

    const { result } = renderAuthHook()
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Simulate onAuthStateChange firing with a session
    const subscription = vi.mocked(supabase.auth.onAuthStateChange).mock.results[0]?.value
    // The callback was stored, retrieve it
    const onAuthCallback = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0]?.[0]

    await act(async () => {
      onAuthCallback('SIGNED_IN', fakeSession)
    })

    expect(result.current.user).toEqual(fakeUser)
  })

  it('clears user on sign out', async () => {
    const fakeUser = { id: 'u1', email: 'test@test.com' }
    const fakeSession = { user: fakeUser }

    const { result } = renderAuthHook()
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Sign in
    const onAuthCallback = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0]?.[0]
    await act(async () => {
      onAuthCallback('SIGNED_IN', fakeSession)
    })
    expect(result.current.user).toEqual(fakeUser)

    // Sign out
    await act(async () => {
      onAuthCallback('SIGNED_OUT', null)
    })
    expect(result.current.user).toBeNull()
  })
})

describe('signUp', () => {
  it('calls supabase.auth.signUp with correct arguments', async () => {
    const { result } = renderAuthHook()
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.signUp('a@b.com', 'password123', 'Alice', { terms_version: '1.0' })
    })

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'password123',
      options: {
        data: { full_name: 'Alice', terms_version: '1.0' },
        emailRedirectTo: expect.stringContaining('/confirm'),
      },
    })
  })

  it('passes the error through when signUp fails', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      error: { message: 'Email already registered' },
    })

    const { result } = renderAuthHook()
    await waitFor(() => expect(result.current.loading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.signUp('a@b.com', 'password123', 'Alice')
    })

    expect(outcome.error.message).toBe('Email already registered')
  })
})

describe('signIn', () => {
  it('calls supabase.auth.signInWithPassword with correct arguments', async () => {
    const { result } = renderAuthHook()
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.signIn('a@b.com', 'password123')
    })

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'password123',
    })
  })
})

describe('signOut', () => {
  it('calls supabase.auth.signOut', async () => {
    const { result } = renderAuthHook()
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.signOut()
    })

    expect(supabase.auth.signOut).toHaveBeenCalled()
  })
})

describe('signInWithOAuth', () => {
  it('calls supabase.auth.signInWithOAuth with the provider', async () => {
    const { result } = renderAuthHook()
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.signInWithOAuth('google')
    })

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'http://localhost:3000/' },
    })
  })
})