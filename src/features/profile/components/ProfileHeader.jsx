/**
 * ProfileHeader — Responsive wrapper that combines avatar and form into the profile page layout.
 *
 * Route: Profile page ("/profile") — top section of the page.
 * Responsibilities: Desktop (lg+): renders a 3-column grid with the avatar on the left and
 *   the form taking the remaining two columns. Mobile/tablet: stacks the avatar with an
 *   "Edit Profile" toggle button; form is hidden by default and shown on tap.
 * Dependencies: lucide-react/Pencil, design/Button, ProfileAvatar, ProfileForm.
 * Important notes: All event handlers (upload, delete, save, edit toggle) are passed as props
 *   from the parent page component which manages the actual data flow.
 *   editing state only affects mobile layout — desktop always shows the form.
 */

import { Pencil } from "lucide-react";
import { Button } from "../../../design";
import ProfileAvatar from "./ProfileAvatar";
import ProfileForm from "./ProfileForm";

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
  // ── Render ────────────────────────────────────────────────────────────
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

          <Button
            leftIcon={Pencil}
            onClick={onEditToggle}
            fullWidth
            className="mt-6"
          >
            {editing ? "Cancel Editing" : "Edit Profile"}
          </Button>
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
