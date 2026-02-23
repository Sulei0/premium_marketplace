-- ============================================================
-- Secure chat_images bucket and add Participant-only RLS
-- ============================================================

-- 1. Make the bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'chat_images';

-- 2. Remove the public policy
DROP POLICY IF EXISTS "Chat images are public" ON storage.objects;

-- 3. Add secure participant-only SELECT policy
DROP POLICY IF EXISTS "Participants can view chat images" ON storage.objects;

CREATE POLICY "Participants can view chat images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat_images'
  AND EXISTS (
    SELECT 1 FROM public.chats c
    WHERE c.id::text = (string_to_array(name, '/'))[1]
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);
