-- ============================================
-- #13 Admin Paneli Hazırlığı — is_admin sütunu
-- ============================================

-- profiles tablosuna is_admin sütunu ekleniyor.
-- Varsayılan değer false (normal kullanıcı).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- İsteğe bağlı: Bir kullanıcıyı admin yapmak için:
-- UPDATE profiles SET is_admin = true WHERE id = '<USER_UUID>';
