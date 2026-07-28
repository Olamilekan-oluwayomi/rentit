/* eslint-disable react-refresh/only-export-components -- Provider + hook in same file is idiomatic for context modules. */

/*
|--------------------------------------------------------------------------
| AuthContext.jsx
|--------------------------------------------------------------------------
|
| Provides authentication state and methods to the component tree.
|
| Purpose: Wraps Supabase Auth to manage the current user session.
| Inputs: children (ReactNode)
| Outputs: Renders AuthContext.Provider wrapping children
| Side effects: Fetches persisted session on mount; subscribes to auth state changes
|
|--------------------------------------------------------------------------
*/

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";

const AuthContext = createContext(null);

/**
 * AuthProvider — React context provider that tracks the authenticated user.
 *
 * On mount it fetches the persisted session and subscribes to auth state
 * changes so the UI stays in sync across tabs / token refreshes.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user from the persisted session & listen for auth events
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to future auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup the subscription to prevent memory leaks
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Register a new user with email, password, and full name.
   * Sends a confirmation email that redirects to /confirm.
   */
  const signUp = (email, password, fullName, extraMetadata = {}) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          ...extraMetadata,
        },
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    });

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  /** Kick off an OAuth flow for the given provider (e.g. "google"). */
  const signInWithOAuth = (provider, redirectTo) =>
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/`,
      },
    });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signInWithOAuth, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state and methods.
 *
 * Must be used inside an <AuthProvider>.
 *
 * @returns {{ user: object|null, loading: boolean, signUp: Function, signIn: Function, signInWithOAuth: Function, signOut: Function }}
 * @throws {Error} If used outside an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
