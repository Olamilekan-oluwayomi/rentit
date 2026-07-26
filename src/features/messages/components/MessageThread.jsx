/**
 * MessageThread — Scrollable list of chat messages with sender-aligned
 * bubbles, timestamps, and auto-scroll to newest message.
 *
 * Own messages are right-aligned with the accent color; messages from
 * the other party are left-aligned with a neutral surface color.
 * Optimistic messages (not yet confirmed by the server) are rendered
 * with reduced opacity.
 *
 * Consecutive messages from the same sender are spaced tightly; when
 * the sender changes the gap widens to visually separate turns.
 */

import { useEffect, useRef } from "react";
import { useAuth } from "../../auth/context/AuthContext";

function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

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
      <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="w-6 h-6 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="text-center px-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <svg className="w-7 h-7 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="text-text-secondary/60 text-sm">
            No messages yet — say hello!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto bg-gray-50/50 dark:bg-white/[0.02] px-4 py-4"
    >
      <div className="max-w-2xl mx-auto space-y-1">
        {messages.map((msg, idx) => {
          const isMine = msg.sender_id === user?.id;
          const isOptimistic = msg._optimistic;
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
          const sameSenderAsPrev = prevMsg && prevMsg.sender_id === msg.sender_id;
          const sameSenderAsNext = nextMsg && nextMsg.sender_id === msg.sender_id;

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"} ${
                sameSenderAsPrev ? "mt-0.5" : "mt-3"
              }`}
            >
              <div
                className={`max-w-[78%] sm:max-w-[65%] px-3.5 py-2 ${
                  isMine
                    ? `bg-accent text-white ${
                        sameSenderAsNext
                          ? "rounded-2xl"
                          : "rounded-2xl rounded-br-md"
                      }`
                    : `bg-white dark:bg-white/10 text-text-primary shadow-sm ${
                        sameSenderAsNext
                          ? "rounded-2xl"
                          : "rounded-2xl rounded-bl-md"
                      }`
                } ${isOptimistic ? "opacity-50" : ""}`}
              >
                <p className="text-[13.5px] leading-[1.45] whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                {!sameSenderAsNext && (
                  <p
                    className={`text-[10px] mt-1 ${
                      isMine ? "text-white/60" : "text-text-secondary/70"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
