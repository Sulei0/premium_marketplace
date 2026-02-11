-- ============================================
-- Kullanıcı Rolü Yönetimi
-- ============================================

-- 1. profiles tablosuna role sütunu ekle (buyer, seller, admin)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer'
CHECK (role IN ('buyer', 'seller', 'admin'));

-- 2. Mevcut is_admin=true olanları role='admin' yap
UPDATE public.profiles
SET role = 'admin'
WHERE is_admin = true;

-- 3. Kullanıcı kendi rolünü güncelleyebilsin (UPDATE politikası)
-- Önce mevcut update politikasını sil (varsa):
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Profiles can update own data'
  ) THEN
    DROP POLICY "Profiles can update own data" ON public.profiles;
  END IF;
END $$;

CREATE POLICY "Profiles can update own data"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
