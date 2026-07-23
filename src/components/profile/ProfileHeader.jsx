import { Pencil } from "lucide-react";
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
  return (
    <>
      {/* Desktop: always show full grid */}
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

      {/* Mobile / Tablet: view or edit mode */}
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
