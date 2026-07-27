import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { Input, Button } from "../../../design";

export default function MessageInput({ onSend, sending, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

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

    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  };

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
