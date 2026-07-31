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
   * If no profile row exists, creates one via upsert.
   * For brand-new users the row may not exist yet (async trigger),
   * so we retry once after a short delay before concluding incomplete.
   */
  const fetchProfile = useCallback(async (isRetry = false) => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function run(retry) {
      let { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("ProfileContext: fetch profile error", fetchError);
        setLoading(false);
        return;
      }

      if (!data) {
        // No profile row yet — first-time user
        const oauthAvatar = getOAuthAvatar();
        const profileData = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          avatar_url: oauthAvatar || null,
        };
        console.log("ProfileContext fetchProfile upsert payload:", profileData);

        const { data: created, error: createError } = await supabase
          .from("profiles")
          .upsert(profileData, { onConflict: "id" })
          .select()
          .maybeSingle();

        if (createError) {
          console.error("ProfileContext: create profile error", createError);
          if (!retry) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY));
            return run(true);
          }
          setLoading(false);
          return;
        }
        data = created;
      }

      // If profile exists but has no avatar, and we haven't retried yet,
      // the row might have been created by a trigger after our first fetch
      // returned nothing. Retry once to catch this race.
      if (!retry && data && !data.avatar_url && getOAuthAvatar()) {
        const oauthAvatar = getOAuthAvatar();
        const { data: updated, error: updateError } = await supabase
          .from("profiles")
          .upsert({ id: user.id, avatar_url: oauthAvatar }, { onConflict: "id" })
          .select()
          .maybeSingle();
        if (updateError) {
          console.error("ProfileContext: update avatar error", updateError);
        }
        if (updated) data = updated;
      }

      setProfile(data);
      setLoading(false);
    }

    return run(isRetry);
  }, [user, getOAuthAvatar]);

  // Re-fetch profile whenever the auth user changes
  useEffect(() => {
    Promise.resolve().then(() => {
      setLoading(true);
      return fetchProfile();
    });
  }, [fetchProfile]);

  // ── Derived completion state ──────────────────────────────────
  const isProfileLoading = loading;
  const isProfileComplete =
    !isProfileLoading &&
    !!profile?.avatar_url &&
    !!profile?.location?.trim();

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
      Promise.resolve().then(() => setTermsOverlayVisible(true));
    }
  }, [loading, profile]);

  // ── Profile completion gate ────────────────────────────────────────
  // After the Terms gate is satisfied (or was never needed), require
  // avatar + location before letting the user into the app.
  useEffect(() => {
    if (!loading && profile && !isProfileComplete) {
      Promise.resolve().then(() => setCompletionVisible(true));
    }
  }, [loading, profile, isProfileComplete]);

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
