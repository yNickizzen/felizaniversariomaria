/*
# Create radio_tracks cache table (single-tenant, no auth)

## Purpose
Permanently stores radio track metadata and Deezer preview URLs so the
radio keeps working even if Deezer's API changes or a track gets removed.
Once a track's preview URL is fetched from Deezer and saved here, the
edge function serves it from this table instead of re-fetching every time.

## New Tables
- `radio_tracks`
  - `slug` (text, primary key) — short identifier e.g. "join-me-in-death"
  - `title` (text) — track title
  - `artist` (text) — artist name
  - `album` (text) — album title
  - `preview` (text) — Deezer 30-second preview URL
  - `cover` (text) — album cover image URL
  - `deezer_id` (bigint) — Deezer track ID for reference
  - `updated_at` (timestamptz) — last refresh timestamp

## Security
- Enable RLS on `radio_tracks`.
- Allow anon + authenticated CRUD because the data is intentionally
  shared/public (no sign-in screen in this app).
- All four CRUD policies use `TO anon, authenticated` with `USING (true)`
  / `WITH CHECK (true)` because every visitor sees the same radio tracks.
*/

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
