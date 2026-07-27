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
import { Card, Heading } from "../../../design";
import { DashboardLayout } from "../../../layouts";
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
   * Rejects files over 10MB before compression runs.
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

    if (file.size > 10 * 1024 * 1024) {
      addToast("Image is too large. Please choose a file under 10MB.", "error");
      return;
    }

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
    <DashboardLayout>
      <Heading as="h1" className="mb-6">
        My Profile
      </Heading>

      <Card className="p-6 sm:p-8 lg:p-10">
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
      </Card>
    </DashboardLayout>
  );
}
