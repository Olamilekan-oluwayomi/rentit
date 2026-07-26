/**
 * BookingChatPage — Dedicated chat page for a specific booking.
 *
 * Route: /booking/:id
 *
 * Full-viewport messaging layout (no global header/footer rendered).
 * Combines the MessageThread (scrollable list) with the MessageInput box.
 * Shows the listing title, counterparty avatar/name, and a back button
 * in a fixed-height header. Marks unread messages as read when opened.
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMessages } from "../features/messages/hooks/useMessages";
import { useSendMessage } from "../features/messages/hooks/useSendMessage";
import { useAuth } from "../features/auth/context/AuthContext";
import { supabase } from "../shared/lib/supabase";
import { getAvatarUrl } from "../utils/storage";
import MessageThread from "../features/messages/components/MessageThread";
import MessageInput from "../features/messages/components/MessageInput";

/**
 * Marks all unread messages in this booking as read for the current user.
 */
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
  const [booking, setBooking] = useState(null);

  // Fetch booking details for the header
  useEffect(() => {
    if (!bookingId || !user) return;

    async function fetchBooking() {
      const { data } = await supabase
        .from("bookings")
        .select(`
          id, listing_id, renter_id, status,
          listings ( title ),
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

  const handleSend = async (content) => {
    addOptimistic(content);
    const { error: sendError } = await sendMessage(bookingId, content);
    if (sendError) {
      console.error("Failed to send message:", sendError);
    }
  };

  const listingTitle = booking?.listings?.title ?? "Booking";
  const isRenter = booking?.renter_id === user?.id;
  const counterpartyName = isRenter
    ? "Owner"
    : (booking?.profiles?.full_name ?? "Renter");

  const counterpartyAvatar = getAvatarUrl(booking?.profiles?.avatar_url);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-background">
      {/* Chat header — fixed height, shadow separates from thread */}
      <div className="shrink-0 h-14 flex items-center gap-3 px-3 bg-white dark:bg-surface border-b border-gray-200/80 dark:border-white/[0.06] shadow-sm z-10">
        <Link
          to="/inbox"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
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
        <div className="shrink-0 px-4 py-2.5 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border-b border-red-100 dark:border-red-500/10">
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
