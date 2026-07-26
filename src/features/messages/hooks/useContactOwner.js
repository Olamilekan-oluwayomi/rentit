/**
 * useContactOwner — Finds or creates an inquiry booking for a listing,
 * then returns a function that navigates to the chat thread.
 *
 * Used by the "Contact Owner" buttons on listing detail pages and owner cards.
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../auth/context/AuthContext";

export function useContactOwner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const contactOwner = useCallback(
    async (listingId) => {
      if (!user || !listingId) return;
      setLoading(true);

      // 1. Check for an existing booking (any status) for this listing by this user.
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("listing_id", listingId)
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        navigate(`/booking/${existing.id}`);
        setLoading(false);
        return;
      }

      // 2. No booking exists — create a minimal inquiry booking so the
      //    messaging system has a booking_id to attach messages to.
      const today = new Date().toISOString().slice(0, 10);
      const { data: newBooking, error } = await supabase
        .from("bookings")
        .insert({
          listing_id: listingId,
          renter_id: user.id,
          start_date: today,
          end_date: today,
          total_price: 0,
          status: "pending",
          owner_message: null,
        })
        .select("id")
        .single();

      setLoading(false);

      if (error) {
        console.error("Failed to create inquiry booking:", error);
        return;
      }

      navigate(`/booking/${newBooking.id}`);
    },
    [user, navigate]
  );

  return { contactOwner, loading };
}
