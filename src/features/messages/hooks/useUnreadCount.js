/**
 * useUnreadCount — Returns the total number of unread messages across
 * all bookings for the current user. Updates in real-time.
 *
 * Used to render the unread badge in the site header.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../auth/context/AuthContext";

/**
 * @returns {{ count: number, loading: boolean }}
 */
export function useUnreadCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!user) {
      setCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Count all unread messages where the sender is NOT the current user.
    // We count across all bookings the user participates in via RLS.
    const { count: unreadCount, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .neq("sender_id", user.id)
      .eq("is_read", false);

    if (!error) {
      setCount(unreadCount ?? 0);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Real-time subscription for new messages sent TO the current user
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("unread-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new;
          if (msg.sender_id !== user.id && !msg.is_read) {
            setCount((c) => c + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new;
          if (msg.sender_id !== user.id && msg.is_read) {
            setCount((c) => Math.max(0, c - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const refetch = useCallback(() => {
    fetchCount();
  }, [fetchCount]);

  return { count, loading, refetch };
}
