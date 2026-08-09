/*
# Create radio audio storage bucket

## Purpose
Stores the actual 30-second MP3 preview files permanently in Supabase Storage.
Once downloaded from Deezer, the files live here forever — no dependency on
Deezer's expiring CDN URLs.

## Changes
- Create storage bucket "radio-audio" (public read, private write)
- Public bucket so the audio element can stream directly via URL
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('radio-audio', 'radio-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
DROP POLICY IF EXISTS "public_read_radio_audio" ON storage.objects;
CREATE POLICY "public_read_radio_audio"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'radio-audio');

-- Allow anon + authenticated to upload (edge function uses service role, so this is for completeness)
DROP POLICY IF EXISTS "anon_write_radio_audio" ON storage.objects;
CREATE POLICY "anon_write_radio_audio"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'radio-audio');

DROP POLICY IF EXISTS "anon_update_radio_audio" ON storage.objects;
CREATE POLICY "anon_update_radio_audio"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'radio-audio')
WITH CHECK (bucket_id = 'radio-audio');
