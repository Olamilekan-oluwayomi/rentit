-- Per-user conversation hiding (soft-delete for the hider only).
-- Each row means "user_id hid booking_id at deleted_at".
-- Other participants are never affected. If a new message arrives
-- after deleted_at the conversation reappears automatically.

CREATE TABLE IF NOT EXISTS conversation_hidden (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deleted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_hidden_user
  ON conversation_hidden(user_id);

ALTER TABLE conversation_hidden ENABLE ROW LEVEL SECURITY;

-- Users can view only their own hidden records
CREATE POLICY "Users can view their own hidden conversations"
  ON conversation_hidden FOR SELECT
  USING (user_id = auth.uid());

-- Users can hide conversations only for themselves
CREATE POLICY "Users can hide conversations for themselves"
  ON conversation_hidden FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can unhide their own records (e.g. if they want it back)
CREATE POLICY "Users can delete their own hidden records"
  ON conversation_hidden FOR DELETE
  USING (user_id = auth.uid());
