/*
|--------------------------------------------------------------------------
| useMessages.js
|--------------------------------------------------------------------------
|
| Fetches message history for a booking with real-time subscription.
|
| Purpose: Loads messages and subscribes to INSERT/UPDATE events; supports optimistic messages.
| Inputs: bookingId (string|null)
| Outputs: { messages, loading, error, addOptimistic, refetch }
| Side effects: Supabase select + real-time subscription via channel
|
|--------------------------------------------------------------------------
*/

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../auth/context/AuthContext";

let channelCounter = 0;

/**
 * @param {string|null} bookingId
 * @returns {{
 *   messages: Array<object>,
 *   loading: boolean,
 *   error: string|null,
 *   addOptimistic: (msg: object) => void,
 *   refetch: () => void
 * }}
 */
export function useMessages(bookingId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const optimisticIdRef = useRef(0);
  const channelRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!bookingId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("messages")
      .select("id, booking_id, sender_id, content, is_read, created_at")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setMessages([]);
    } else {
      setMessages(data ?? []);
    }

    setLoading(false);
  }, [bookingId, user]);

  useEffect(() => {
    Promise.resolve().then(() => fetchMessages());
  }, [fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!bookingId || !user) return;

    // Tear down any previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const name = `messages-${bookingId}-${++channelCounter}`;
    const channel = supabase
      .channel(name)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const incoming = payload.new;
          setMessages((prev) => {
            // Replace optimistic placeholder if one exists with matching sender_id + content
            const optimisticIdx = prev.findIndex(
              (m) => m._optimistic && m.sender_id === incoming.sender_id && m.content === incoming.content
            );
            if (optimisticIdx !== -1) {
              const next = [...prev];
              next[optimisticIdx] = incoming;
              return next;
            }
            // Avoid duplicates if the row was already in the initial fetch
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const updated = payload.new;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [bookingId, user]);

  /**
   * Adds a local optimistic message that will be replaced once the
   * real-time INSERT event fires with the server-confirmed row.
   */
  const addOptimistic = useCallback(
    (content) => {
      const optimisticMsg = {
        id: `optimistic-${++optimisticIdRef.current}`,
        booking_id: bookingId,
        sender_id: user.id,
        content,
        is_read: false,
        created_at: new Date().toISOString(),
        _optimistic: true,
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      return optimisticMsg;
    },
    [bookingId, user]
  );

  const refetch = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, addOptimistic, refetch };
}
