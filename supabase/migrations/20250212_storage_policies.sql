-- ============================================================
-- Storage Bucket: product-images Güvenlik Politikaları
-- KRİTİK: Bu SQL'i Supabase SQL Editor'da çalıştırın!
-- ============================================================

-- 1. Bucket'ı oluştur (varsa hata vermez)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SELECT: Herkes görselleri okuyabilir (public bucket)
CREATE POLICY "Public read access for product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- 3. INSERT: Giriş yapmış kullanıcılar sadece kendi klasörlerine yükleyebilir
--    Dosya yolu formatı: user_id/dosya_adı
--    Sadece resim dosyaları kabul edilir (image/jpeg, image/png, image/webp)
CREATE POLICY "Users can upload images to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (
      storage.extension(name) = 'jpg'
      OR storage.extension(name) = 'jpeg'
      OR storage.extension(name) = 'png'
      OR storage.extension(name) = 'webp'
    )
  );

-- 4. UPDATE: Kullanıcı sadece kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. DELETE: Kullanıcı sadece kendi dosyalarını silebilir
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
