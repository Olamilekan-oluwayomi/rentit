import { getAvatarUrl } from "../../../utils/storage";
import { useAuth } from "../../auth/context/AuthContext";
import { useContactOwner } from "../../messages/hooks/useContactOwner";
import { Avatar, Button } from "../../../design";

export default function OwnerCard({ owner, loading, listingId }) {
  const { user } = useAuth();
  const { contactOwner, loading: contactLoading } = useContactOwner();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 bg-surface-tertiary/60 rounded" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-tertiary/60" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-surface-tertiary/60 rounded w-2/3" />
            <div className="h-3 bg-surface-tertiary/60 rounded w-1/3" />
          </div>
        </div>
        <div className="h-3 bg-surface-tertiary/60 rounded w-full" />
        <div className="h-3 bg-surface-tertiary/60 rounded w-4/5" />
        <div className="h-10 bg-surface-tertiary/60 rounded-lg" />
      </div>
    );
  }

  if (!owner) return null;

  const avatarSrc = getAvatarUrl(owner.avatar_url);
  const memberSince = new Date(owner.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
      <div className="flex items-center gap-4">
        <Avatar src={avatarSrc} name={owner.full_name} size="xl" />
        <div className="min-w-0">
          <p className="text-lg font-heading font-semibold text-text-primary truncate">
            {owner.full_name || "Anonymous"}
          </p>
          <p className="text-sm text-text-muted">Host</p>
          <p className="text-xs text-text-muted">Member since {memberSince}</p>
        </div>
      </div>

      {owner.bio && (
        <p className="text-sm text-text-secondary leading-relaxed">{owner.bio}</p>
      )}

      {owner.location && (
        <p className="text-xs text-text-muted flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {owner.location}
        </p>
      )}

      {user && user.id !== owner.id && listingId && (
        <Button
          variant="outline"
          fullWidth
          onClick={() => contactOwner(listingId)}
          loading={contactLoading}
          disabled={contactLoading}
        >
          {contactLoading ? "Opening chat..." : "Message Host"}
        </Button>
      )}
    </div>
  );
}
