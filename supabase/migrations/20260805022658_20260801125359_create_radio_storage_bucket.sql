INSERT INTO storage.buckets (id, name, public)
VALUES ('radio-audio', 'radio-audio', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_radio_audio" ON storage.objects;
CREATE POLICY "public_read_radio_audio"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'radio-audio');

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