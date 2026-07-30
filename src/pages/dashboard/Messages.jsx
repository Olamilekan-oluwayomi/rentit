/*
|--------------------------------------------------------------------------
| DashboardMessages.jsx
|--------------------------------------------------------------------------
|
| Messages page for the dashboard. Lists all conversations with previews,
| counterparty avatars, timestamps, and unread badges. Each conversation
| links to /booking/:id for the full chat.
|
| Route: /dashboard/messages (mounted inside DashboardShell)
| Responsibilities: Display conversations with unread indicators
| Dependencies: useConversations, AnimatedList, FadeInSection
| Notes: Similar to InboxPage but rendered inside DashboardShell chrome
|        instead of full-viewport AppLayout.
|
|--------------------------------------------------------------------------
*/

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useConversations } from "../../features/messages/hooks/useConversations";
import { useDeleteConversation } from "../../features/messages/hooks/useDeleteConversation";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import { getAvatarUrl } from "../../utils/storage";
import AnimatedList, { AnimatedListItem } from "../../shared/components/AnimatedList";
import FadeInSection from "../../shared/components/FadeInSection";

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

export default function DashboardMessages() {
  const navigate = useNavigate();
  const { conversations, loading, error, refetch } = useConversations();
  const { deleteConversation, deleting } = useDeleteConversation();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error: delErr } = await deleteConversation(deleteTarget);
    if (!delErr) {
      setDeleteTarget(null);
      refetch();
    }
  };

  return (
    <FadeInSection>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-text-primary">
          Messages
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Conversations with renters and hosts.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {loading && (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
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
          <div className="p-8 text-center">
            <p className="text-sm text-text-secondary">{error}</p>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-14 h-14 rounded-lg bg-surface-secondary flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-sm text-text-muted text-center">
              No conversations yet. Messages will appear here when you book a listing or receive a booking request.
            </p>
            <Link to="/" className="inline-block mt-3 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded">
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate(`/users/${conv.counterparty?.id}`);
                    }}
                    className="shrink-0 w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-accent/40 transition-all cursor-pointer"
                    aria-label={`View ${conv.counterparty?.full_name ?? "user"}'s profile`}
                  >
                    {getAvatarUrl(conv.counterparty?.avatar_url, { width: 44, height: 44 }) ? (
                      <img src={getAvatarUrl(conv.counterparty.avatar_url, { width: 44, height: 44 })} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-accent font-heading font-bold text-sm">
                        {(conv.counterparty?.full_name ?? "?")[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm truncate leading-tight ${conv.unreadCount > 0 ? "font-semibold text-text-primary" : "font-medium text-text-primary"}`}>
                        {conv.listing?.title ?? "Listing"}
                      </h3>
                      <span className="shrink-0 text-[11px] text-text-secondary/70">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        navigate(`/users/${conv.counterparty?.id}`);
                      }}
                      className="text-xs text-text-secondary truncate leading-tight mt-0.5 hover:text-accent transition-colors text-left cursor-pointer w-full"
                    >
                      {conv.counterparty?.full_name ?? "User"}
                      {conv.isRenter ? " · Owner" : " · Renter"}
                    </button>
                    <p className={`text-[13px] truncate mt-1 leading-tight ${conv.unreadCount > 0 ? "text-text-primary font-medium" : "text-text-secondary/80"}`}>
                      {conv.lastSenderIsMe ? "You: " : ""}
                      {conv.lastMessage}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteTarget(conv.bookingId);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-danger hover:bg-danger/5 transition-colors"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={15} />
                    </button>
                    {conv.unreadCount > 0 && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-white text-[10px] font-bold">
                        {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </div>
    </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete conversation?"
        message="This will hide the conversation from your inbox. It will reappear if the other person sends a new message."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </FadeInSection>
  );
}
