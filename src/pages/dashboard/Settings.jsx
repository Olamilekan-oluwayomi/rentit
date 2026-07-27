import { useState } from "react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useProfileContext } from "../../features/profile/context/ProfileContext";
import { getAvatarUrl } from "../../utils/storage";
import { Button } from "../../design";
import FadeInSection from "../../shared/components/FadeInSection";

export default function DashboardSettings() {
  const { user } = useAuth();
  const { profile, updateProfile, saving } = useProfileContext();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const handleSave = async () => {
    await updateProfile({ full_name: fullName, location, bio });
  };

  const avatarSrc = getAvatarUrl(profile?.avatar_url);
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-8">
      <FadeInSection>
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">
            Settings
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your profile, preferences, and account settings.
          </p>
        </div>
      </FadeInSection>

      {/* Profile */}
      <FadeInSection>
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-heading font-semibold text-text-primary">Profile</h3>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center text-lg font-semibold overflow-hidden shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{displayName}</p>
                <p className="text-xs text-text-secondary">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Full Name</label>
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-tertiary/30 text-sm text-text-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Location</label>
              <input
                type="text"
                autoComplete="address-level2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="City, State"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Bio</label>
              <textarea
                autoComplete="off"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                placeholder="Tell renters a bit about yourself..."
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} loading={saving}>Save Changes</Button>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* Security */}
      <FadeInSection>
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-heading font-semibold text-text-primary">Security</h3>
          </div>
          <div className="p-5 space-y-4">
            <Button variant="outline" size="sm">Change Password</Button>
            <p className="text-xs text-text-muted">Two-factor authentication — coming soon.</p>
          </div>
        </div>
      </FadeInSection>

      {/* Notifications preferences */}
      <FadeInSection>
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-heading font-semibold text-text-primary">Notification Preferences</h3>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-text-muted">Email and push notification settings — coming soon.</p>
          </div>
        </div>
      </FadeInSection>

      {/* Payment methods */}
      <FadeInSection>
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-heading font-semibold text-text-primary">Payment Methods & Payouts</h3>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-text-muted">Connect a payment method to receive payouts from your rentals — coming soon.</p>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
}
