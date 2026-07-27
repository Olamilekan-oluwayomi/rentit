/**
 * MessageInput — Chat message input with auto-resize textarea and Send button.
 *
 * Route: Messages page ("/messages/:conversationId") — bottom of the chat panel.
 * Responsibilities: Manages local text state, sends on Enter (without Shift) or button click,
 *   auto-resizes the textarea up to 96px, resets after send, and disables during sending.
 * Dependencies: lucide-react/Send, design/Input + Button, useRef for textarea height management.
 * Important notes: Enter sends (without Shift). Shift+Enter inserts a newline.
 *   Textarea height resets to "auto" after send, then the next handleInput recalculates.
 */

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { Input, Button } from "../../../design";

export default function MessageInput({ onSend, sending, disabled }) {
  // ── State & Refs ──────────────────────────────────────────────────────
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // ── Event Handlers ────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    onSend(trimmed);
    setText("");

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

    requestAnimationFrame(() => {
      const el = e.target;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    });
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="shrink-0 border-t border-border bg-surface px-4 py-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            ref={textareaRef}
            type="textarea"
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={disabled}
            className="resize-none min-h-[40px] max-h-[96px]"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          loading={sending}
          size="md"
          className="shrink-0"
          aria-label="Send message"
        >
          {!sending && <Send size={16} />}
        </Button>
      </div>
    </div>
  );
}
