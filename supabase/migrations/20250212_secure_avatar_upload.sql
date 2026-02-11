-- Enhancing Security for Avatar Uploads
-- This script updates the policies to restrict uploads to specific mime types

-- Drop existing upload policy if exists to recreate with stricter checks
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;

-- Re-create policy with MIME type check
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'webp')
    AND (metadata->>'mimetype' = 'image/jpeg' OR metadata->>'mimetype' = 'image/png' OR metadata->>'mimetype' = 'image/webp')
  );

-- Also update the UPDATE policy just in case
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'webp')
    AND (metadata->>'mimetype' = 'image/jpeg' OR metadata->>'mimetype' = 'image/png' OR metadata->>'mimetype' = 'image/webp')
  );
