/**
 * ProfileContext — Provides the current user's profile data to the component tree.
 *
 * Fetches the profile row from Supabase on auth changes and auto-creates one
 * if it doesn't exist yet (first login / new user).
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { supabase } from "../../../shared/lib/supabase";

const ProfileContext = createContext(null);

/**
 * ProfileProvider — React context provider for user profile state.
 *
 * Depends on AuthProvider being higher in the tree (uses useAuth()).
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the profile for the currently authenticated user.
   * If no profile row exists (PGRST116), it creates one via upsert
   * using metadata from the auth user.
   */
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // PGRST116 = "Row not found" — first-time user with no profile row yet
    if (fetchError && fetchError.code === "PGRST116") {
      const { data: created, error: createError } = await supabase
        .from("profiles")
        .upsert(
          { id: user.id, full_name: user.user_metadata?.full_name || "" },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (createError) {
        setLoading(false);
        return;
      }
      data = created;
    } else if (fetchError) {
      setLoading(false);
      return;
    }

    setProfile(data);
    setLoading(false);
  }, [user]);

  // Re-fetch profile whenever the auth user changes
  useEffect(() => {
    (async () => {
      await fetchProfile();
    })();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, refreshProfile: fetchProfile, loading }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * Hook to access profile state and actions.
 *
 * Must be used inside a <ProfileProvider>.
 *
 * @returns {{ profile: object|null, setProfile: Function, refreshProfile: Function, loading: boolean }}
 * @throws {Error} If used outside a ProfileProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}
