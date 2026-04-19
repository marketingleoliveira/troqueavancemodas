
-- Storage bucket for return request photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('return-photos', 'return-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for the bucket (photos are viewable by URL)
CREATE POLICY "Public can view return photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'return-photos');

-- Authenticated users can upload to their own folder (folder = user uid)
CREATE POLICY "Users can upload their own return photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'return-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can manage (delete) their own photos
CREATE POLICY "Users can delete their own return photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'return-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add photos column on return_request_items
ALTER TABLE public.return_request_items
ADD COLUMN IF NOT EXISTS photos text[] NOT NULL DEFAULT '{}';
