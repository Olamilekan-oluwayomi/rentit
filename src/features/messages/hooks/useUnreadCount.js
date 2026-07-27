/*
|--------------------------------------------------------------------------
| useUnreadCount.js
|--------------------------------------------------------------------------
|
| Returns the total unread message count across all bookings, updated in real-time.
|
| Purpose: Provides unread badge count for the site header.
| Inputs: (none — uses useAuth internally)
| Outputs: { count, loading, refetch }
| Side effects: Supabase count query + real-time subscription for INSERT/UPDATE
|
|--------------------------------------------------------------------------
*/

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../auth/context/AuthContext";

// Monotonically increasing counter so every channel name is unique,
// even across React StrictMode double-mounts. removeChannel() is async
// but React re-runs the effect synchronously, so reusing a name would
// return the still-subscribed singleton and throw.
let channelCounter = 0;

/**
 * @returns {{ count: number, loading: boolean }}
 */
export function useUnreadCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const fetchCount = useCallback(async () => {
    if (!user) {
      setCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

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

    // Tear down any previous channel (best-effort, may still be pending)
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Each mount gets a unique name so we never hit the singleton
    const name = `unread-count-${++channelCounter}`;
    const channel = supabase
      .channel(name)
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

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user]);

  const refetch = useCallback(() => {
    fetchCount();
  }, [fetchCount]);

  return { count, loading, refetch };
}
