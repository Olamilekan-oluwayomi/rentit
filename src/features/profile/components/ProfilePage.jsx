/**
 * ProfilePage — User profile view and edit page.
 *
 * Displays the user's avatar, name, location, and bio. Supports
 * avatar upload/delete and inline profile editing. All mutations
 * are delegated to the useProfile hook which handles Supabase calls.
 */

import { useState } from "react";
import { useToast } from "../../../shared/contexts/ToastContext";
import { useProfile } from "../hooks/useProfile";
import ProfileHeader from "./ProfileHeader";
import ProfileSkeleton from "./ProfileSkeleton";

/**
 * @returns {JSX.Element} The profile page with avatar management and editable details.
 */
export default function ProfilePage() {
  const {
    profile,
    saving,
    uploading,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  } = useProfile();
  const { addToast } = useToast();
  const [avatarError, setAvatarError] = useState(null);
  const [editing, setEditing] = useState(false);

  /**
   * Validates and uploads a new avatar file.
   * Displays a validation error inline if the file is invalid.
   * @param {File|null} file - The image file selected by the user.
   * @param {string|null} validationError - Error string from client-side validation.
   */
  const handleUploadAvatar = async (file, validationError) => {
    setAvatarError(null);

    if (validationError) {
      setAvatarError(validationError);
      return;
    }

    if (!file) return;

    const result = await uploadAvatar(file);
    if (result.error) {
      setAvatarError(result.error);
    } else {
      addToast("Avatar updated!");
    }
  };

  /** Removes the user's avatar image from storage. */
  const handleDeleteAvatar = async () => {
    setAvatarError(null);
    const result = await deleteAvatar();
    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast("Avatar removed.");
    }
  };

  /**
   * Persists profile field updates and exits editing mode on success.
   * @param {Object} updates - The fields to update (full_name, location, bio).
   */
  const handleSaveProfile = async (updates) => {
    const result = await updateProfile(updates);
    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast("Profile updated!");
      setEditing(false);
    }
  };

  // Show a skeleton while the initial profile data is being fetched.
  if (saving || uploading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-8 lg:mb-12">
        My Profile
      </h1>

      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-6 sm:p-8 lg:p-10">
        <ProfileHeader
          profile={profile}
          saving={saving}
          uploading={uploading}
          avatarError={avatarError}
          editing={editing}
          onUploadAvatar={handleUploadAvatar}
          onDeleteAvatar={handleDeleteAvatar}
          onSaveProfile={handleSaveProfile}
          onEditToggle={() => setEditing((prev) => !prev)}
        />
      </div>
    </div>
  );
}
