/*
|--------------------------------------------------------------------------
| ProfilePage.jsx
|--------------------------------------------------------------------------
|
| User profile view and edit page. Displays avatar, name, location, bio.
| Supports avatar upload/delete and inline profile editing. All mutations
| delegated to useProfile hook (Supabase calls). Enforces 10MB file size
| limit on avatar uploads before compression.
|
| Route: /profile (wrapped in ProtectedRoute)
| Responsibilities: Display and edit user profile; manage avatar
| Dependencies: useProfile, useToast, ProfileHeader, ProfileSkeleton, DashboardLayout
| Notes: Shows skeleton while profile loads. Editing mode toggled via
|        local state. Avatar validation (size) done client-side.
|
|--------------------------------------------------------------------------
*/

import { useState } from "react";
import { useToast } from "../../../shared/contexts/ToastContext";
import { useProfile } from "../hooks/useProfile";
import { Card, Heading } from "../../../design";
import { DashboardLayout } from "../../../layouts";
import ProfileHeader from "./ProfileHeader";
import ProfileSkeleton from "./ProfileSkeleton";
import FadeInSection from "../../../shared/components/FadeInSection";

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

  const handleDeleteAvatar = async () => {
    setAvatarError(null);
    const result = await deleteAvatar();
    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast("Avatar removed.");
    }
  };

  const handleSaveProfile = async (updates) => {
    const result = await updateProfile(updates);
    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast("Profile updated!");
      setEditing(false);
    }
  };

  if (saving || uploading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <FadeInSection>
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
      </FadeInSection>
    </DashboardLayout>
  );
}
