/**
 * OwnerCard.jsx
 * --------------
 * Displays the listing owner's profile information on the listing detail page.
 * Shows avatar (or initials fallback), name, location, and member-since date.
 * Includes a "Contact Owner" button that's only visible to authenticated users
 * who are not the listing owner (avoids self-contact).
 * Renders a loading skeleton while owner data is being fetched.
 */
import { getAvatarUrl } from "../../../utils/storage";
import { useAuth } from "../../auth/context/AuthContext";
import { useContactOwner } from "../../messages/hooks/useContactOwner";

/**
 * Displays the listing owner's info card.
 * Shows a skeleton during loading, nothing if no owner data, and the full
 * profile card with contact option when data is available.
 * @param {{ owner: object|null, loading: boolean, listingId?: string }} props
 */
export default function OwnerCard({ owner, loading, listingId }) {
  const { user } = useAuth();
  const { contactOwner, loading: contactLoading } = useContactOwner();

  // Loading skeleton — matches the exact dimensions of the real card to prevent layout shift.
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

  // No owner data — render nothing (e.g., listing has no owner assigned).
  if (!owner) return null;

  const avatarSrc = getAvatarUrl(owner.avatar_url);
  // Format the account creation date for a human-friendly display.
  const memberSince = new Date(owner.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-6">
      <h3 className="text-sm font-medium text-text-secondary mb-4">Listed by</h3>
      <div className="flex items-center gap-4">
        {/* Avatar — shows image or initials fallback for users without an avatar */}
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`${owner.full_name}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            // Initials fallback — takes first two initials from the full name.
            // Sliced to 2 chars max for consistent sizing.
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
          {/* Location is optional — not all owners have it set */}
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

      {/* Contact button — only shown to non-owner authenticated users.
          Prevents the owner from seeing a "Contact Yourself" button. */}
      {user && user.id !== owner.id && listingId && (
        <button
          onClick={() => contactOwner(listingId)}
          disabled={contactLoading}
          className="mt-4 block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-white/15 text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {contactLoading ? "Opening chat..." : "Contact Owner"}
        </button>
      )}
    </div>
  );
}
