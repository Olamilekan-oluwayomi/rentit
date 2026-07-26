/**
 * InboxPage — Lists all active conversations for the current user.
 *
 * Route: /inbox
 *
 * Full-viewport layout (no global header/footer rendered).
 * Shows every booking the user participates in (as renter or owner) that
 * has at least one message, sorted by most recent activity. Each row
 * displays the listing title, counterparty name/avatar, last message
 * preview, timestamp, and an unread badge.
 */

import { Link } from "react-router-dom";
import { useConversations } from "../features/messages/hooks/useConversations";
import { getAvatarUrl } from "../utils/storage";
import AnimatedList, { AnimatedListItem } from "../shared/components/AnimatedList";

function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function InboxPage() {
  const { conversations, loading, error } = useConversations();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background">
      {/* Header bar — matches chat page header height and style */}
      <div className="shrink-0 h-14 flex items-center px-5 bg-white dark:bg-surface border-b border-gray-200/80 dark:border-white/[0.06] shadow-sm z-10">
        <h1 className="text-base font-heading font-semibold text-text-primary">
          Messages
        </h1>
      </div>

      {/* Content — fills remaining space */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-text-secondary text-sm py-20 text-center">{error}</p>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-text-secondary/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <p className="text-text-secondary/60 text-sm text-center">
              No conversations yet
            </p>
            <Link
              to="/"
              className="inline-block mt-3 text-sm font-medium text-accent hover:underline"
            >
              Browse Listings
            </Link>
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <AnimatedList>
            {conversations.map((conv) => (
              <AnimatedListItem key={conv.bookingId}>
                <Link
                  to={`/booking/${conv.bookingId}`}
                  className={`flex items-center gap-3 px-5 py-3.5 transition-colors border-b border-gray-100 dark:border-white/[0.04] ${
                    conv.unreadCount > 0
                      ? "bg-accent/[0.03] dark:bg-accent/[0.05]"
                      : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                    {getAvatarUrl(conv.counterparty?.avatar_url) ? (
                      <img
                        src={getAvatarUrl(conv.counterparty.avatar_url)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-accent font-heading font-bold text-sm">
                        {(conv.counterparty?.full_name ?? "?")[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm truncate leading-tight ${
                          conv.unreadCount > 0
                            ? "font-semibold text-text-primary"
                            : "font-medium text-text-primary"
                        }`}
                      >
                        {conv.listing?.title ?? "Listing"}
                      </h3>
                      <span className="shrink-0 text-[11px] text-text-secondary/70">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary truncate leading-tight mt-0.5">
                      {conv.counterparty?.full_name ?? "User"}
                      {conv.isRenter ? " (owner)" : " (renter)"}
                    </p>
                    <p
                      className={`text-[13px] truncate mt-1 leading-tight ${
                        conv.unreadCount > 0
                          ? "text-text-primary font-medium"
                          : "text-text-secondary/80"
                      }`}
                    >
                      {conv.lastSenderIsMe ? "You: " : ""}
                      {conv.lastMessage}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-white text-[10px] font-bold">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </span>
                  )}
                </Link>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </div>
    </div>
  );
}
