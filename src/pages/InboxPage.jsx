/**
 * InboxPage — Lists all active conversations for the current user.
 *
 * Route: /inbox
 *
 * Shows every booking the user participates in (as renter or owner) that
 * has at least one message, sorted by most recent activity. Each row
 * displays the listing title, counterparty name, last message preview,
 * timestamp, and an unread badge.
 */

import { Link } from "react-router-dom";
import { useConversations } from "../features/messages/hooks/useConversations";
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-6">
        Messages
      </h1>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-text-secondary text-sm py-8 text-center">{error}</p>
      )}

      {!loading && !error && conversations.length === 0 && (
        <div className="text-center py-16">
          <svg
            className="w-12 h-12 mx-auto text-text-secondary/30 mb-4"
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
          <p className="text-text-secondary text-sm">
            No conversations yet. Start chatting from a booking!
          </p>
          <Link
            to="/"
            className="inline-block mt-4 text-sm font-medium text-accent hover:underline"
          >
            Browse Listings
          </Link>
        </div>
      )}

      {!loading && !error && conversations.length > 0 && (
        <AnimatedList className="space-y-2">
          {conversations.map((conv) => (
            <AnimatedListItem key={conv.bookingId}>
              <Link
                to={`/booking/${conv.bookingId}`}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                  conv.unreadCount > 0
                    ? "bg-accent/5 border-accent/20 dark:border-accent/30"
                    : "bg-surface border-gray-100 dark:border-white/10 hover:shadow-md"
                }`}
              >
                {/* Listing thumbnail */}
                <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5">
                  {conv.listing?.images?.[0] ? (
                    <img
                      src={conv.listing.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary/30">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="text-sm font-heading font-semibold text-text-primary truncate">
                      {conv.listing?.title ?? "Listing"}
                    </h3>
                    <span className="shrink-0 text-[10px] text-text-secondary">
                      {formatRelativeTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary truncate">
                    {conv.counterparty?.full_name ?? "User"}
                    {conv.isRenter ? " (owner)" : " (renter)"}
                  </p>
                  <p
                    className={`text-xs truncate mt-0.5 ${
                      conv.unreadCount > 0
                        ? "text-text-primary font-medium"
                        : "text-text-secondary"
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
  );
}
