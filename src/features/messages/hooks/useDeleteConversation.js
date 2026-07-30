/*
|--------------------------------------------------------------------------
| useDeleteConversation.js
|--------------------------------------------------------------------------
|
| Hides a conversation (booking thread) for the current user only.
| Other participants are never affected. The conversation reappears
| automatically if a new message arrives after the deletion timestamp.
|
| Purpose: Inserts a row into conversation_hidden table (per-user soft-delete).
| Inputs: bookingId
| Outputs: { deleteConversation, deleting }
| Side effects: Upserts into conversation_hidden table
|
|--------------------------------------------------------------------------
*/

import { useState, useCallback } from "react";
import { supabase } from "../../../shared/lib/supabase";

export function useDeleteConversation() {
  const [deleting, setDeleting] = useState(false);

  const deleteConversation = useCallback(async (bookingId) => {
    setDeleting(true);

    const { error } = await supabase
      .from("conversation_hidden")
      .insert({ booking_id: bookingId })
      .select()
      .single();

    setDeleting(false);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }, []);

  return { deleteConversation, deleting };
}
