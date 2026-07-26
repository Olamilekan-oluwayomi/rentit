/**
 * useSendMessage — Inserts a new row into the messages table.
 *
 * Returns a sendMessage function and a sending state flag.
 * Callers should use addOptimistic from useMessages to show the
 * message instantly, then call sendMessage for the actual insert.
 */

import { useCallback, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../auth/context/AuthContext";

/**
 * @returns {{
 *   sendMessage: (bookingId: string, content: string) => Promise<{ error: string|null }>,
 *   sending: boolean
 * }}
 */
export function useSendMessage() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(
    async (bookingId, content) => {
      if (!user || !bookingId || !content.trim()) {
        return { error: "Missing required fields" };
      }

      setSending(true);

      const { error: insertError } = await supabase.from("messages").insert({
        booking_id: bookingId,
        sender_id: user.id,
        content: content.trim(),
      });

      setSending(false);

      if (insertError) {
        return { error: insertError.message };
      }

      return { error: null };
    },
    [user]
  );

  return { sendMessage, sending };
}
