/*
|--------------------------------------------------------------------------
| BookingChatPage.jsx
|--------------------------------------------------------------------------
|
| Dedicated chat page for a specific booking. Full-viewport messaging
| layout (no global header/footer). Combines MessageThread and MessageInput.
| Marks unread messages as read on open. Gates first message behind
| profile completion.
|
| Route: /booking/:id
| Responsibilities: Real-time chat for a single booking; auto-mark read; profile gate
| Dependencies: useMessages, useSendMessage, useRequireCompleteProfile, supabase
| Notes: Suppressed global Navbar/Footer via AppLayout's NO_FOOTER_PATHS.
|        Counterparty determined by comparing renter_id to current user.
|
|--------------------------------------------------------------------------
*/

import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useMessages } from "../features/messages/hooks/useMessages";
import { useSendMessage } from "../features/messages/hooks/useSendMessage";
import { useAuth } from "../features/auth/context/AuthContext";
import { useRequireCompleteProfile } from "../features/profile/hooks/useRequireCompleteProfile";
import { supabase } from "../shared/lib/supabase";
import { getAvatarUrl } from "../utils/storage";
import MessageThread from "../features/messages/components/MessageThread";
import MessageInput from "../features/messages/components/MessageInput";

// Marks all unread messages in this booking as read for the current user.
async function markMessagesRead(bookingId, userId) {
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("booking_id", bookingId)
    .neq("sender_id", userId)
    .eq("is_read", false);
}

export default function BookingChatPage() {
  const { id: bookingId } = useParams();
  const { user } = useAuth();
  const { messages, loading, error, addOptimistic } = useMessages(bookingId);
  const { sendMessage, sending } = useSendMessage();
  const { requireProfile } = useRequireCompleteProfile();
  const [booking, setBooking] = useState(null);

  // Fetch booking details for the header
  useEffect(() => {
    if (!bookingId || !user) return;

    async function fetchBooking() {
      const { data } = await supabase
        .from("bookings")
        .select(`
          id, listing_id, renter_id, status,
          listings ( title, owner_id, profiles:owner_id ( full_name, avatar_url ) ),
          profiles:renter_id ( full_name, avatar_url )
        `)
        .eq("id", bookingId)
        .single();

      setBooking(data);
    }

    fetchBooking();
  }, [bookingId, user]);

  // Mark unread messages as read when opening the chat
  useEffect(() => {
    if (bookingId && user) {
      markMessagesRead(bookingId, user.id);
    }
  }, [bookingId, user]);

  // Also mark as read when new messages arrive from the other party
  useEffect(() => {
    if (!bookingId || !user || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender_id !== user.id && !lastMsg.is_read) {
      markMessagesRead(bookingId, user.id);
    }
  }, [messages, bookingId, user]);

  const doSend = async (content) => {
    addOptimistic(content);
    const { error: sendError } = await sendMessage(bookingId, content);
    if (sendError) {
      console.error("Failed to send message:", sendError);
    }
  };

  // Gate the first message behind profile completion; subsequent sends pass through.
  const handleSend = useCallback(
    (content) => {
      if (messages.length === 0) {
        requireProfile(() => doSend(content));
      } else {
        doSend(content);
      }
    },
    [messages.length, requireProfile]
  );

  const listingTitle = booking?.listings?.title ?? "Booking";
  const isRenter = booking?.renter_id === user?.id;

  // Pick the counterparty profile: owner if I'm the renter, renter if I'm the owner
  const counterpartyProfile = isRenter
    ? booking?.listings?.profiles
    : booking?.profiles;
  const counterpartyName = counterpartyProfile?.full_name ?? (isRenter ? "Owner" : "Renter");
  const counterpartyAvatar = getAvatarUrl(counterpartyProfile?.avatar_url);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat header — fixed height, shadow separates from thread */}
      <div className="shrink-0 h-14 flex items-center gap-3 px-3 bg-surface border-b border-border z-10">
        <Link
          to="/inbox"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-secondary transition-colors"
          aria-label="Back to inbox"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Avatar */}
        <div className="shrink-0 w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
          {counterpartyAvatar ? (
            <img
              src={counterpartyAvatar}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-accent font-heading font-bold text-xs">
              {counterpartyName[0]?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold text-text-primary truncate leading-tight">
            {listingTitle}
          </h1>
          <p className="text-xs text-text-secondary truncate leading-tight">
            {counterpartyName}
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="shrink-0 px-4 py-2.5 text-sm text-danger bg-danger/5 border-b border-danger/10">
          {error}
        </div>
      )}

      {/* Message thread — fills remaining space */}
      <MessageThread messages={messages} loading={loading} />

      {/* Message input — fixed at bottom */}
      <MessageInput onSend={handleSend} sending={sending} />
    </div>
  );
}
