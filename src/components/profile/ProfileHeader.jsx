import ProfileAvatar from "./ProfileAvatar";
import ProfileForm from "./ProfileForm";

export default function ProfileHeader({
  profile,
  saving,
  uploading,
  avatarError,
  onUploadAvatar,
  onDeleteAvatar,
  onSaveProfile,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Left column: Avatar */}
      <div className="flex justify-center lg:justify-start">
        <ProfileAvatar
          avatarUrl={profile?.avatar_url}
          uploading={uploading}
          onUpload={onUploadAvatar}
          onDelete={onDeleteAvatar}
          error={avatarError}
        />
      </div>

      {/* Right column: Form */}
      <div className="lg:col-span-2">
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
  );
}
