/*
|--------------------------------------------------------------------------
| ProfileContext.jsx
|--------------------------------------------------------------------------
|
| Provides the current user's profile data and completion state.
|
| Purpose: Fetches profile row from Supabase on auth changes, auto-creates
|          one if missing, and pre-fills avatar_url from OAuth metadata.
| Inputs: children (ReactNode)
| Outputs: Renders ProfileContext.Provider wrapping children
| Side effects: API calls to supabase/profiles; retries fetch for new users
|
|--------------------------------------------------------------------------
*/

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { supabase } from "../../../shared/lib/supabase";

const ProfileContext = createContext(null);

/** Delay before retrying profile fetch for brand-new users (ms). */
const RETRY_DELAY = 800;

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
  const [completionVisible, setCompletionVisible] = useState(false);
  const [termsOverlayVisible, setTermsOverlayVisible] = useState(false);
  const completionResolveRef = useRef(null);

  /**
   * Extract the avatar URL from OAuth provider metadata.
   * Google puts it under `picture`, Apple under `avatar_url`,
   * general OAuth under `picture` or `data?.avatar_url`.
   */
  const getOAuthAvatar = useCallback(() => {
    if (!user) return null;
    const meta = user.user_metadata || {};
    return meta.picture || meta.avatar_url || user.identities?.[0]?.identity_data?.picture || null;
  }, [user]);

  /**
   * Fetch the profile for the currently authenticated user.
   * If no profile row exists (PGRST116), creates one via upsert.
   * For brand-new users the row may not exist yet (async trigger),
   * so we retry once after a short delay before concluding incomplete.
   */
  const fetchProfile = useCallback(async (isRetry = false) => {
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
      // Auto-populate avatar from OAuth if available
      const oauthAvatar = getOAuthAvatar();

      const meta = user.user_metadata || {};
      const provider = user.identities?.[0]?.provider || "email";
      const profileData = {
        id: user.id,
        full_name: user.user_metadata?.full_name || meta.name || "",
        avatar_url: oauthAvatar || null,
        provider,
      };

      if (meta.terms_accepted_at) {
        profileData.terms_accepted_at = meta.terms_accepted_at;
        profileData.terms_version = meta.terms_version || null;
      }
      if (meta.privacy_accepted_at) {
        profileData.privacy_accepted_at = meta.privacy_accepted_at;
        profileData.privacy_version = meta.privacy_version || null;
      }

      const { data: created, error: createError } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: "id" })
        .select()
        .single();

      if (createError) {
        // Retry once if the row might be created by a DB trigger
        if (!isRetry) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          return fetchProfile(true);
        }
        setLoading(false);
        return;
      }
      data = created;
    } else if (fetchError) {
      setLoading(false);
      return;
    }

    // If profile exists but has no avatar, and we haven't retried yet,
    // the row might have been created by a trigger after our first fetch
    // returned PGRST116. Retry once to catch this race.
    if (!isRetry && data && !data.avatar_url && getOAuthAvatar()) {
      const oauthAvatar = getOAuthAvatar();
      const { data: updated } = await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url: oauthAvatar }, { onConflict: "id" })
        .select()
        .single();
      if (updated) data = updated;
    }

    setProfile(data);
    setLoading(false);
  }, [user, getOAuthAvatar]);

  // Re-fetch profile whenever the auth user changes
  useEffect(() => {
    setLoading(true);
    (async () => {
      await fetchProfile();
    })();
  }, [fetchProfile]);

  // ── Derived completion state ──────────────────────────────────
  const isProfileLoading = loading;
  const isProfileComplete =
    !isProfileLoading &&
    !!profile?.avatar_url &&
    (profile?.full_name?.trim().length ?? 0) >= 2;

  // ── Overlay visibility (imperative API via context) ───────────
  const showCompletion = useCallback(() => {
    setCompletionVisible(true);
  }, []);

  const hideCompletion = useCallback(() => {
    setCompletionVisible(false);
    // Resolve any pending action that was gated on completion
    if (completionResolveRef.current) {
      completionResolveRef.current();
      completionResolveRef.current = null;
    }
  }, []);

  /**
   * Returns a promise that resolves when the profile is complete.
   * If already complete, resolves immediately. Otherwise shows the
   * overlay and waits for the user to finish.
   */
  const waitForCompletion = useCallback(() => {
    if (isProfileComplete) return Promise.resolve();
    showCompletion();
    return new Promise((resolve) => {
      completionResolveRef.current = resolve;
    });
  }, [isProfileComplete, showCompletion]);

  const hideTermsAcceptance = useCallback(() => {
    setTermsOverlayVisible(false);
  }, []);

  // ── Terms acceptance gate ──────────────────────────────────────────
  // After profile loads, show the terms overlay if terms were never accepted.
  // This catches OAuth users who skipped the RegisterPage checkbox. Existing
  // email/password users who accepted during signup already have the field set.
  useEffect(() => {
    if (!loading && profile && !profile.terms_accepted_at) {
      setTermsOverlayVisible(true);
    }
  }, [loading, profile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        refreshProfile: fetchProfile,
        loading,
        isProfileLoading,
        isProfileComplete,
        completionVisible,
        termsOverlayVisible,
        showCompletion,
        hideCompletion,
        hideTermsAcceptance,
        waitForCompletion,
      }}
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
 * @returns {{ profile, setProfile, refreshProfile, loading, isProfileLoading, isProfileComplete, completionVisible, termsOverlayVisible, showCompletion, hideCompletion, hideTermsAcceptance, waitForCompletion }}
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
