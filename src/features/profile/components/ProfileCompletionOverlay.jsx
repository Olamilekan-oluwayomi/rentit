/**
 * ProfileCompletionOverlay — Non-dismissable overlay that forces the user
 * to upload an avatar and set their location before using the app.
 *
 * Route: Any protected page — conditionally rendered by ProfileContext when
 *        the profile is missing avatar_url or location.
 * Responsibilities: Presents a modal with avatar upload and a location field
 *   (with geolocation auto-detect). Updates the profile and hides on success.
 * Dependencies: ProfileContext (profile, hideCompletion), useProfile (updateProfile, uploadAvatar),
 *   ProfileAvatar subcomponent, useCurrentLocation hook.
 * Important notes: Cannot be dismissed by the user (no close button, no backdrop click).
 *   Runs after the Terms acceptance gate is satisfied.
 */

import { useState } from "react";
import { MapPinned } from "lucide-react";
import { useProfileContext } from "../context/ProfileContext";
import { useProfile } from "../hooks/useProfile";
import { useCurrentLocation } from "../../../shared/hooks/useCurrentLocation";
import { useToast } from "../../../shared/contexts/ToastContext";
import ProfileAvatar from "./ProfileAvatar";

export default function ProfileCompletionOverlay() {
  // ── State ────────────────────────────────────────────────────────────
  const { profile, hideCompletion } = useProfileContext();
  const { updateProfile, uploadAvatar, uploading, saving } = useProfile();
  const { getCurrentLocation, loading: locationLoading } = useCurrentLocation();
  const { addToast } = useToast();

  const [location, setLocation] = useState(profile?.location || "");
  const [avatarError, setAvatarError] = useState("");
  const [hasAvatar, setHasAvatar] = useState(!!profile?.avatar_url);
  const [submitting, setSubmitting] = useState(false);

  const locationTrimmed = location.trim();
  const locationValid = locationTrimmed.length > 0;
  const canSubmit = locationValid && hasAvatar && !submitting;

  // ── Event Handlers ────────────────────────────────────────────────────
  const handleUpload = async (file, validationError) => {
    if (validationError) {
      setAvatarError(validationError);
      return;
    }
    if (!file) return;

    setAvatarError("");
    const result = await uploadAvatar(file);
    if (result.success) setHasAvatar(true);
  };

  const handleDetectLocation = async () => {
    const { location: detected, error } = await getCurrentLocation();
    if (error) {
      addToast(error, "error");
      return;
    }
    setLocation(detected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    const result = await updateProfile({ location: locationTrimmed });
    setSubmitting(false);

    if (result.error) {
      addToast(result.error, "error");
      return;
    }

    hideCompletion();
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-xl font-heading font-bold text-text-primary text-center mb-1">
          Complete your profile
        </h2>
        <p className="text-sm text-text-secondary text-center mb-6">
          Upload a photo and set your location to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar — centered, larger variant */}
          <div className="flex justify-center">
            <ProfileAvatar
              avatarUrl={profile?.avatar_url}
              uploading={uploading}
              onUpload={handleUpload}
              onDelete={() => {}}
              error={avatarError}
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="completion-location"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Location
            </label>
            <div className="relative">
              <input
                id="completion-location"
                type="text"
                autoComplete="address-level2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={80}
                placeholder="City, Country"
                autoFocus
                className="w-full px-4 py-2.5 pr-11 border border-border rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locationLoading}
                title="Use current location"
                aria-label="Use current location"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-secondary hover:text-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-[0.97]"
              >
                {locationLoading ? (
                  <div className="w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MapPinned size={18} strokeWidth={2} />
                )}
              </button>
            </div>
            {!locationValid && locationTrimmed.length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Must be at least 1 character.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {(submitting || saving) && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {submitting || saving ? "Saving..." : "Save and Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}