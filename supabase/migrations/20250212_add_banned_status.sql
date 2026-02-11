-- ============================================================
-- Kullanıcı Yasaklama (Ban) Özelliği
-- ============================================================

-- profiles tablosuna is_banned sütunu ekle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- RLS: Yasaklı kullanıcıların sisteme erişimini kısıtlamak için.
-- Genelde auth.users tablosunda banlanır ama uygulama seviyesinde de kontrol edebiliriz.
-- Şimdilik sadece sütunu ekliyoruz, uygulama tarafında kontrol edeceğiz (AuthContext veya RLS).
