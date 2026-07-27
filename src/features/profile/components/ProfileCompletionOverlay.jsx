/**
 * ProfileCompletionOverlay — Non-dismissable overlay that forces the user
 * to upload an avatar and confirm their full name before they can perform
 * actions that require a trustworthy profile (booking, messaging, listing).
 *
 * Reuses ProfileAvatar for upload/preview and validates the name field
 * with the same rules as ProfileForm (min 2 chars, max 60).
 */

import { useState } from "react";
import { useProfileContext } from "../context/ProfileContext";
import { useProfile } from "../hooks/useProfile";
import ProfileAvatar from "./ProfileAvatar";

const NAME_MIN = 2;
const NAME_MAX = 60;

export default function ProfileCompletionOverlay() {
  const { profile, hideCompletion } = useProfileContext();
  const { updateProfile, uploadAvatar, uploading, saving } = useProfile();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [nameError, setNameError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [hasAvatar, setHasAvatar] = useState(!!profile?.avatar_url);
  const [submitting, setSubmitting] = useState(false);

  const trimmedName = fullName.trim();
  const nameValid = trimmedName.length >= NAME_MIN && trimmedName.length <= NAME_MAX;
  const canSubmit = nameValid && hasAvatar && !submitting;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    const result = await updateProfile({ full_name: trimmedName });
    setSubmitting(false);

    if (result.error) {
      setNameError(result.error);
      return;
    }

    // Profile is now complete — hide the overlay
    hideCompletion();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-xl font-heading font-bold text-text-primary text-center mb-1">
          Complete your profile
        </h2>
        <p className="text-sm text-text-secondary text-center mb-6">
          Upload a photo and confirm your name to continue.
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

          {/* Full name */}
          <div>
            <label
              htmlFor="completion-full-name"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Full Name
            </label>
            <input
              id="completion-full-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setNameError("");
              }}
              maxLength={NAME_MAX}
              required
              autoFocus
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
            />
            {nameError && (
              <p className="text-xs text-red-500 mt-1">{nameError}</p>
            )}
            {!nameError && trimmedName.length > 0 && trimmedName.length < NAME_MIN && (
              <p className="text-xs text-red-500 mt-1">
                Must be at least {NAME_MIN} characters.
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
            {submitting || saving ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
