/**
 * useConversations — Fetches all active conversations for the current user
 * across all bookings (both as renter and owner).
 *
 * Uses the conversation_summaries view which returns the latest message
 * and unread count per booking the user participates in.
 *
 * Enriches each conversation with listing and counterparty profile data.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../auth/context/AuthContext";

/**
 * @returns {{
 *   conversations: Array<object>,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: () => void
 * }}
 */
export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Step 1: Fetch bookings the user participates in.
    const { data: renterBookings, error: renterErr } = await supabase
      .from("bookings")
      .select("id, listing_id, renter_id, status, created_at")
      .eq("renter_id", user.id);

    const { data: ownedListings, error: ownedErr } = await supabase
      .from("listings")
      .select("id")
      .eq("owner_id", user.id);

    if (renterErr || ownedErr) {
      setError((renterErr || ownedErr).message);
      setConversations([]);
      setLoading(false);
      return;
    }

    const ownedListingIds = (ownedListings ?? []).map((l) => l.id);

    let ownerBookings = [];
    if (ownedListingIds.length > 0) {
      const { data, error: ownerErr } = await supabase
        .from("bookings")
        .select("id, listing_id, renter_id, status, created_at")
        .in("listing_id", ownedListingIds);

      if (ownerErr) {
        setError(ownerErr.message);
        setConversations([]);
        setLoading(false);
        return;
      }
      ownerBookings = data ?? [];
    }

    // Merge and dedupe bookings
    const allBookings = [...(renterBookings ?? []), ...ownerBookings];
    const bookingMap = new Map(allBookings.map((b) => [b.id, b]));
    const bookingIds = [...bookingMap.keys()];

    if (bookingIds.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Step 2: Fetch latest message for each booking
    const { data: latestMessages, error: msgErr } = await supabase
      .from("messages")
      .select("booking_id, content, created_at, sender_id")
      .in("booking_id", bookingIds)
      .order("created_at", { ascending: false });

    if (msgErr) {
      setError(msgErr.message);
      setConversations([]);
      setLoading(false);
      return;
    }

    // Keep only the latest message per booking
    const latestByBooking = new Map();
    for (const msg of latestMessages ?? []) {
      if (!latestByBooking.has(msg.booking_id)) {
        latestByBooking.set(msg.booking_id, msg);
      }
    }

    // Step 3: Fetch unread counts
    const { data: unreadRows } = await supabase
      .from("messages")
      .select("booking_id")
      .in("booking_id", bookingIds)
      .neq("sender_id", user.id)
      .eq("is_read", false);

    const unreadMap = new Map();
    for (const row of unreadRows ?? []) {
      unreadMap.set(row.booking_id, (unreadMap.get(row.booking_id) ?? 0) + 1);
    }

    // Step 4: Enrich with listing titles and counterparty names
    const listingIds = [...new Set(allBookings.map((b) => b.listing_id))];
    const { data: listings } = await supabase
      .from("listings")
      .select("id, title, images")
      .in("id", listingIds);

    const listingsMap = new Map((listings ?? []).map((l) => [l.id, l]));

    const counterpartyIds = [
      ...new Set(allBookings.map((b) => b.renter_id).filter((id) => id !== user.id)),
    ];

    // Also need owner IDs for bookings where user is the renter
    const { data: ownerListings } = await supabase
      .from("listings")
      .select("id, owner_id")
      .in("id", listingIds);

    const ownerMap = new Map((ownerListings ?? []).map((l) => [l.id, l.owner_id]));
    const allCounterpartyIds = [...counterpartyIds];
    for (const b of renterBookings ?? []) {
      const ownerId = ownerMap.get(b.listing_id);
      if (ownerId && ownerId !== user.id) allCounterpartyIds.push(ownerId);
    }
    const uniqueCounterpartyIds = [...new Set(allCounterpartyIds)];

    let profilesMap = new Map();
    if (uniqueCounterpartyIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", uniqueCounterpartyIds);

      profilesMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    }

    // Step 5: Build conversation list
    const result = bookingIds
      .filter((id) => latestByBooking.has(id))
      .map((id) => {
        const booking = bookingMap.get(id);
        const listing = listingsMap.get(booking.listing_id);
        const latestMsg = latestByBooking.get(id);
        const isRenter = booking.renter_id === user.id;
        const counterpartyId = isRenter
          ? ownerMap.get(booking.listing_id)
          : booking.renter_id;
        const counterparty = profilesMap.get(counterpartyId);

        return {
          bookingId: id,
          listing,
          counterparty,
          isRenter,
          lastMessage: latestMsg.content,
          lastMessageAt: latestMsg.created_at,
          lastSenderIsMe: latestMsg.sender_id === user.id,
          unreadCount: unreadMap.get(id) ?? 0,
          status: booking.status,
        };
      })
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    setConversations(result);
    setLoading(false);
  }, [user, refreshKey]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { conversations, loading, error, refetch };
}
