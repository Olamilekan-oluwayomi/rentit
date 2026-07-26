/**
 * MessageThread — Scrollable list of chat messages with sender-aligned
 * bubbles, timestamps, and auto-scroll to newest message.
 *
 * Own messages are right-aligned with the accent color; messages from
 * the other party are left-aligned with a neutral surface color.
 * Optimistic messages (not yet confirmed by the server) are rendered
 * with reduced opacity.
 */

import { useEffect, useRef } from "react";
import { useAuth } from "../../auth/context/AuthContext";

function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return time;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${time}`;
  }

  return `${date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })} ${time}`;
}

/**
 * @param {{ messages: Array<object>, loading: boolean }} props
 */
export default function MessageThread({ messages, loading }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-6 h-6 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <p className="text-text-secondary text-sm">
          No messages yet. Say hello!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
    >
      {messages.map((msg) => {
        const isMine = msg.sender_id === user?.id;
        const isOptimistic = msg._optimistic;

        return (
          <div
            key={msg.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 ${
                isMine
                  ? "bg-accent text-white rounded-br-md"
                  : "bg-gray-100 dark:bg-white/10 text-text-primary rounded-bl-md"
              } ${isOptimistic ? "opacity-50" : ""}`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {msg.content}
              </p>
              <p
                className={`text-[10px] mt-1 ${
                  isMine
                    ? "text-white/70"
                    : "text-text-secondary"
                }`}
              >
                {formatTime(msg.created_at)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
