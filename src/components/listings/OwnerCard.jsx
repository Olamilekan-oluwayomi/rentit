import { getAvatarUrl } from "../../utils/storage";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Displays the listing owner's info card.
 * @param {{ owner: object|null, loading: boolean }}
 */
export default function OwnerCard({ owner, loading }) {
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/5" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-2/3" />
            <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-1/2" />
          </div>
        </div>
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
    <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-6">
      <h3 className="text-sm font-medium text-text-secondary mb-4">Listed by</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`${owner.full_name}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-accent font-heading font-bold text-lg">
              {owner.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {owner.full_name || "Anonymous"}
          </p>
          {owner.location && (
            <p className="text-xs text-text-secondary truncate">
              {owner.location}
            </p>
          )}
          <p className="text-xs text-text-secondary">
            Member since {memberSince}
          </p>
        </div>
      </div>

      {user && user.id !== owner.id && (
        <a
          href={`mailto:?subject=RentIt%20-%20Inquiry`}
          className="mt-4 block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-white/15 text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          Contact Owner
        </a>
      )}
    </div>
  );
}
