-- Messages table for real-time booking chat
-- Run this migration to add messaging support to RentIt.

-- 1. Messages table
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) > 0),
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(booking_id, sender_id, is_read) WHERE is_read = false;

-- 3. Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Both the renter and owner of a booking can read messages for that booking.
CREATE POLICY "Users can read messages for their bookings"
  ON messages FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      WHERE b.renter_id = auth.uid()
         OR b.listing_id IN (
           SELECT l.id FROM listings l WHERE l.owner_id = auth.uid()
         )
    )
  );

-- Authenticated users can insert messages for bookings they're part of.
CREATE POLICY "Users can send messages for their bookings"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND booking_id IN (
      SELECT b.id FROM bookings b
      WHERE b.renter_id = auth.uid()
         OR b.listing_id IN (
           SELECT l.id FROM listings l WHERE l.owner_id = auth.uid()
         )
    )
  );

-- Users can update is_read on messages they received (not their own).
CREATE POLICY "Users can mark received messages as read"
  ON messages FOR UPDATE
  USING (
    sender_id != auth.uid()
    AND booking_id IN (
      SELECT b.id FROM bookings b
      WHERE b.renter_id = auth.uid()
         OR b.listing_id IN (
           SELECT l.id FROM listings l WHERE l.owner_id = auth.uid()
         )
    )
  )
  WITH CHECK (
    sender_id != auth.uid()
  );

-- 5. Enable realtime for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 6. Conversation summary view (latest message + unread count per booking)
CREATE OR REPLACE VIEW conversation_summaries AS
SELECT DISTINCT ON (m.booking_id)
  m.booking_id,
  m.content AS last_message,
  m.created_at AS last_message_at,
  m.sender_id AS last_sender_id,
  (
    SELECT COUNT(*) FROM messages unread
    WHERE unread.booking_id = m.booking_id
      AND unread.sender_id != auth.uid()
      AND unread.is_read = false
  )::INT AS unread_count
FROM messages m
WHERE m.booking_id IN (
  SELECT b.id FROM bookings b
  WHERE b.renter_id = auth.uid()
     OR b.listing_id IN (
       SELECT l.id FROM listings l WHERE l.owner_id = auth.uid()
     )
)
ORDER BY m.booking_id, m.created_at DESC;
