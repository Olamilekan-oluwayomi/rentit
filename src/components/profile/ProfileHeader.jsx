/**
 * ProfileHeader — Responsive wrapper that combines avatar and form into the profile page layout.
 *
 * Desktop (lg+): renders a 3-column grid with the avatar on the left and
 * the form taking the remaining two columns.
 *
 * Mobile/tablet: stacks the avatar and a toggle button. The form is only
 * shown when the user taps "Edit Profile", keeping the initial view clean.
 *
 * @param {Object} props
 * @param {Object} props.profile - The current user's profile data.
 * @param {boolean} props.saving - Whether a profile save is in progress.
 * @param {boolean} props.uploading - Whether an avatar upload is in progress.
 * @param {string|null} props.avatarError - Avatar validation/upload error to display.
 * @param {boolean} props.editing - Whether the form is currently visible (mobile only).
 * @param {(file: File|null, error?: string) => void} props.onUploadAvatar - Avatar upload handler.
 * @param {() => void} props.onDeleteAvatar - Avatar delete handler.
 * @param {(updates: Object) => void} props.onSaveProfile - Profile save handler.
 * @param {() => void} props.onEditToggle - Toggles the editing state on mobile.
 * @returns {JSX.Element} The responsive profile header layout.
 */

import { Pencil } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import ProfileForm from "./ProfileForm";

/**
 * @param {Object} props
 * @returns {JSX.Element} The profile header with avatar and form.
 */
export default function ProfileHeader({
  profile,
  saving,
  uploading,
  avatarError,
  editing,
  onUploadAvatar,
  onDeleteAvatar,
  onSaveProfile,
  onEditToggle,
}) {
  return (
    <>
      {/* Desktop: side-by-side avatar + form, always visible */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-12">
        <div className="flex justify-start">
          <ProfileAvatar
            avatarUrl={profile?.avatar_url}
            uploading={uploading}
            onUpload={onUploadAvatar}
            onDelete={onDeleteAvatar}
            error={avatarError}
          />
        </div>

        <div className="col-span-2">
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-6">
            Profile Details
          </h2>
          <ProfileForm
            profile={profile}
            saving={saving}
            onSave={onSaveProfile}
          />
        </div>
      </div>

      {/* Mobile / Tablet: avatar + edit toggle, form conditionally shown */}
      <div className="lg:hidden">
        <div className="flex flex-col items-center">
          <ProfileAvatar
            avatarUrl={profile?.avatar_url}
            uploading={uploading}
            onUpload={onUploadAvatar}
            onDelete={onDeleteAvatar}
            error={avatarError}
          />

          <button
            onClick={onEditToggle}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 active:opacity-80 transition-opacity"
          >
            <Pencil size={16} strokeWidth={2} />
            {editing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </div>

        {editing && (
          <div className="mt-8">
            <h2 className="text-lg font-heading font-semibold text-text-primary mb-6">
              Profile Details
            </h2>
            <ProfileForm
              profile={profile}
              saving={saving}
              onSave={onSaveProfile}
            />
          </div>
        )}
      </div>
    </>
  );
}
