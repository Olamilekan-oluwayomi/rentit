/*
|--------------------------------------------------------------------------
| InboxPage.jsx
|--------------------------------------------------------------------------
|
| Full-page message inbox listing all conversations. Each conversation
| links to /booking/:id for the full chat view. Shows last message
| preview, relative timestamps, counterparty avatar, and unread badge.
|
| Route: /inbox
| Responsibilities: List all conversations with previews and unread indicators
| Dependencies: useConversations hook, AnimatedList, FadeInSection
| Notes: Uses full viewport height (suppressed global footer via AppLayout).
|        Relative timestamps formatted as "2m", "3h", "5d", or date.
|
|--------------------------------------------------------------------------
*/

import { Link } from "react-router-dom";
import { useConversations } from "../features/messages/hooks/useConversations";
import { getAvatarUrl } from "../utils/storage";
import AnimatedList, { AnimatedListItem } from "../shared/components/AnimatedList";
import FadeInSection from "../shared/components/FadeInSection";

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
    <FadeInSection>
    <div className="h-full flex flex-col bg-background">
      <div className="shrink-0 h-14 flex items-center px-5 bg-surface border-b border-border z-10">
        <h1 className="text-base font-heading font-semibold text-text-primary">
          Messages
        </h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading && (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-surface-tertiary/60 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-surface-tertiary/60 rounded w-1/3" />
                  <div className="h-2.5 bg-surface-tertiary/40 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-text-secondary text-sm py-20 text-center">{error}</p>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-14 h-14 rounded-lg bg-surface-secondary flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-text-muted"
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
            <p className="text-text-secondary text-sm text-center">
              No conversations yet
            </p>
            <Link
              to="/"
              className="inline-block mt-3 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
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
                  className={`flex items-center gap-3 px-5 py-3.5 transition-colors border-b border-border active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                    conv.unreadCount > 0
                      ? "bg-accent/[0.03]"
                      : "hover:bg-surface-secondary"
                  }`}
                >
                  <div className="shrink-0 w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                    {getAvatarUrl(conv.counterparty?.avatar_url, { width: 44, height: 44 }) ? (
                      <img
                        src={getAvatarUrl(conv.counterparty.avatar_url, { width: 44, height: 44 })}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-accent font-heading font-bold text-sm">
                        {(conv.counterparty?.full_name ?? "?")[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

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
    </FadeInSection>
  );
}
