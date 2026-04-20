
-- Remove any size limit and allow all image mime types on the existing bucket
UPDATE storage.buckets
SET file_size_limit = NULL,
    allowed_mime_types = NULL
WHERE id = 'return-photos';

-- Allow authenticated users to upload into return-photos (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Authenticated upload return-photos'
  ) THEN
    CREATE POLICY "Authenticated upload return-photos"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'return-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public read return-photos'
  ) THEN
    CREATE POLICY "Public read return-photos"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'return-photos');
  END IF;
END $$;
