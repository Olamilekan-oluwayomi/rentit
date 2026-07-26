/**
 * useMessages — Fetches message history for a specific booking with
 * a real-time Supabase subscription so new messages appear live.
 *
 * Returns a local messages array that includes optimistic messages
 * (added before the server confirms them). When the real-time event
 * arrives for a message that was already inserted optimistically,
 * it replaces the placeholder with the server-confirmed row.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../auth/context/AuthContext";

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
  const [refreshKey, setRefreshKey] = useState(0);
  const optimisticIdRef = useRef(0);

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
  }, [bookingId, user, refreshKey]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!bookingId || !user) return;

    const channel = supabase
      .channel(`messages:${bookingId}`)
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

    return () => {
      supabase.removeChannel(channel);
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
    setRefreshKey((k) => k + 1);
  }, []);

  return { messages, loading, error, addOptimistic, refetch };
}
