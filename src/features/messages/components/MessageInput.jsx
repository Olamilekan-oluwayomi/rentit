/**
 * MessageInput — Text input box with send button for composing messages.
 *
 * Uses a <textarea> that auto-resizes up to 4 lines. Enter sends the
 * message (Shift+Enter for a newline). Disables the send button while
 * the message is empty or being sent.
 */

import { useRef, useState } from "react";

/**
 * @param {{
 *   onSend: (text: string) => void,
 *   sending: boolean,
 *   disabled?: boolean
 * }} props
 */
export default function MessageInput({ onSend, sending, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    onSend(trimmed);
    setText("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);

    // Auto-resize up to 4 lines
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  };

  return (
    <div className="shrink-0 border-t border-gray-200/80 dark:border-white/[0.06] bg-white dark:bg-surface shadow-[0_-2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.2)] px-4 py-3">
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
