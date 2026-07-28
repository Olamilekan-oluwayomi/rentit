/*
|--------------------------------------------------------------------------
| Create favorites table
|--------------------------------------------------------------------------
|
| Allows users to save/bookmark listings they're interested in.
| Each row represents one user saving one listing. The UNIQUE constraint
| on (user_id, listing_id) prevents duplicate saves.
|
| RLS: users can only read, insert, and delete their own favorites.
|
|--------------------------------------------------------------------------
*/

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own favorites"
  ON favorites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
