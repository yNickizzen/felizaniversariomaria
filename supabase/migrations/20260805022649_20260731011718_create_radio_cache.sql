CREATE TABLE IF NOT EXISTS radio_tracks (
  slug text PRIMARY KEY,
  title text NOT NULL,
  artist text NOT NULL,
  album text NOT NULL,
  preview text NOT NULL,
  cover text NOT NULL DEFAULT '',
  deezer_id bigint,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE radio_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_radio_tracks" ON radio_tracks;
CREATE POLICY "anon_select_radio_tracks"
ON radio_tracks FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_radio_tracks" ON radio_tracks;
CREATE POLICY "anon_insert_radio_tracks"
ON radio_tracks FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_radio_tracks" ON radio_tracks;
CREATE POLICY "anon_update_radio_tracks"
ON radio_tracks FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_radio_tracks" ON radio_tracks;
CREATE POLICY "anon_delete_radio_tracks"
ON radio_tracks FOR DELETE
TO anon, authenticated USING (true);